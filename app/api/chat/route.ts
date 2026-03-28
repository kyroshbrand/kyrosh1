import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@/lib/supabase";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { getFAQContext } from "@/lib/faq-data";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId, userName, userPhone } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    let currentSessionId = sessionId;

    // Create session if new
    if (!currentSessionId) {
      if (!userName || !userPhone) {
        return Response.json(
          { error: "Name and phone are required to start a chat" },
          { status: 400 }
        );
      }

      const { data: session, error: sessErr } = await supabase
        .from("chat_sessions")
        .insert({ name: userName.trim(), phone: userPhone.trim() })
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
      // Human takeover — don't call AI, wait for admin reply
      return Response.json({
        reply: null,
        sessionId: currentSessionId,
        awaitingHuman: true,
      });
    }

    // Not connected to human — call Gemini AI
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    // Get conversation history
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

The user's name is: ${sessionData?.name || userName}
The user's phone number is: ${sessionData?.phone || userPhone}

${faqContext}

Remember: Keep responses short (2-4 sentences max), friendly, and always guide toward WhatsApp or a phone call.`;

    // Try models with fallback
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
          console.warn(`Rate limited on ${modelName}, trying next...`);
          continue;
        }
        throw modelError;
      }
    }

    // Save bot reply
    await supabase.from("messages").insert({
      session_id: currentSessionId,
      role: "bot",
      content: botReply,
      is_seen: false,
    });

    // Update session timestamp
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", currentSessionId);

    return Response.json({
      reply: botReply,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
