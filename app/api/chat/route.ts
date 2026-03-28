import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@/lib/supabase";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { getFAQContext } from "@/lib/faq-data";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get current user from cookie
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return null;
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    return decoded.userId || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const userId = await getCurrentUser();
    let currentSessionId = sessionId;

    // Create session if new
    if (!currentSessionId) {
      if (!userId) {
        return Response.json({ error: "Please log in to start a chat" }, { status: 401 });
      }

      // Get user info
      const { data: user } = await supabase
        .from("users")
        .select("name, phone")
        .eq("id", userId)
        .single();

      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      const { data: session, error: sessErr } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          name: user.name,
          phone: user.phone,
        })
        .select("id")
        .single();

      if (sessErr || !session) {
        console.error("Session create error:", sessErr);
        return Response.json({ error: "Failed to create session" }, { status: 500 });
      }
      currentSessionId = session.id;
    }

    // Insert user message
    await supabase.from("messages").insert({
      session_id: currentSessionId,
      role: "user",
      content: message.trim(),
      is_seen: false,
    });

    // Check if human is connected
    const { data: sessionData } = await supabase
      .from("chat_sessions")
      .select("is_human_connected, name, phone")
      .eq("id", currentSessionId)
      .single();

    if (sessionData?.is_human_connected) {
      return Response.json({
        reply: null,
        sessionId: currentSessionId,
        awaitingHuman: true,
      });
    }

    // Call Gemini AI
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("session_id", currentSessionId)
      .order("created_at", { ascending: true });

    const conversationHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const faqContext = getFAQContext();
    const fullSystemInstruction = `${SYSTEM_PROMPT}

The user's name is: ${sessionData?.name || "User"}
The user's phone number is: ${sessionData?.phone || ""}

${faqContext}

Remember: Keep responses short (2-4 sentences max), friendly, and always guide toward WhatsApp or a phone call.`;

    const models = ["gemini-2.0-flash-lite", "gemini-2.0-flash"];
    let botReply = "";

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: fullSystemInstruction,
        });
        const chat = model.startChat({
          history: conversationHistory.slice(0, -1),
        });
        const result = await chat.sendMessage(message.trim());
        botReply = result.response.text();
        break;
      } catch (modelError: unknown) {
        const err = modelError as { status?: number };
        if (err?.status === 429 && modelName !== models[models.length - 1]) {
          continue;
        }
        throw modelError;
      }
    }

    await supabase.from("messages").insert({
      session_id: currentSessionId,
      role: "bot",
      content: botReply,
      is_seen: false,
    });

    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", currentSessionId);

    return Response.json({ reply: botReply, sessionId: currentSessionId });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
