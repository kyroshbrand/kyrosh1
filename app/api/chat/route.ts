import { createServerClient } from "@/lib/supabase";
import { generateEmbedding, vectorToString } from "@/lib/embeddings";
import { cookies } from "next/headers";

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

// Build a natural response from matched FAQs
function buildResponse(
  matches: { question: string; answer: string; similarity: number }[],
  userName: string
): string {
  if (!matches || matches.length === 0) {
    return `Thanks for your message, ${userName}! I'm not sure about that specific question. Let me connect you with our team — reach out on WhatsApp and we'll help you right away!`;
  }

  const best = matches[0];

  if (best.similarity > 0.6) {
    // High confidence — return the best match directly
    return best.answer;
  } else if (best.similarity > 0.3) {
    // Medium confidence — return with context
    return best.answer;
  } else {
    // Low confidence — suggest related
    return `${best.answer}\n\nWant to know more? WhatsApp us and we'll give you all the details! [ICON:Phone]`;
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
        .insert({ user_id: userId, name: user.name, phone: user.phone })
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
      .select("is_human_connected, name")
      .eq("id", currentSessionId)
      .single();

    if (sessionData?.is_human_connected) {
      return Response.json({
        reply: null,
        sessionId: currentSessionId,
        awaitingHuman: true,
      });
    }

    // --- Vector search for FAQ matching ---
    const queryEmbedding = generateEmbedding(message.trim());

    const { data: matches, error: matchErr } = await supabase.rpc("match_faqs", {
      query_embedding: vectorToString(queryEmbedding),
      match_count: 3,
      match_threshold: 0.05,
    });

    if (matchErr) {
      console.error("Vector search error:", matchErr);
    }

    const botReply = buildResponse(
      matches || [],
      sessionData?.name || "there"
    );

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

    return Response.json({ reply: botReply, sessionId: currentSessionId });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
