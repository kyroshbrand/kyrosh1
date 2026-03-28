import { createServerClient } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, message } = await request.json();

    if (!sessionId || !message?.trim()) {
      return Response.json({ error: "Session ID and message are required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Insert admin message
    const { error: msgErr } = await supabase.from("messages").insert({
      session_id: sessionId,
      role: "admin",
      content: message.trim(),
      is_seen: false,
    });

    if (msgErr) {
      return Response.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Update session timestamp
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
