import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;

    if (!token) {
      return Response.json({ user: null });
    }

    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (!decoded.userId) {
      return Response.json({ user: null });
    }

    const supabase = createServerClient();

    const { data: user } = await supabase
      .from("users")
      .select("id, name, phone")
      .eq("id", decoded.userId)
      .single();

    if (!user) {
      return Response.json({ user: null });
    }

    // Get user's chat sessions
    const { data: sessions } = await supabase
      .from("chat_sessions")
      .select("id, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    // Get all unread messages for these sessions in one query to optimize performance
    const sessionIds = (sessions || []).map(s => s.id);
    const { data: allUnread } = await supabase
      .from("messages")
      .select("session_id")
      .in("session_id", sessionIds)
      .in("role", ["bot", "admin"])
      .eq("is_seen", false);

    const unreadMap: Record<string, number> = {};
    (allUnread || []).forEach(msg => {
      unreadMap[msg.session_id] = (unreadMap[msg.session_id] || 0) + 1;
    });

    // Get last message for each session in parallel
    const enrichedSessions = await Promise.all(
      (sessions || []).map(async (sess) => {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, role, created_at")
          .eq("session_id", sess.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...sess,
          lastMessage: lastMsg?.content || "No messages yet",
          lastMessageRole: lastMsg?.role || "",
          unreadCount: unreadMap[sess.id] || 0,
        };
      })
    );

    return Response.json({ user, sessions: enrichedSessions });
  } catch {
    return Response.json({ user: null });
  }
}

// Logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("user_token");
  return Response.json({ success: true });
}
