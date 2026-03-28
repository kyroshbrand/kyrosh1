import { createServerClient } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // Get all sessions with last message and unread count
  const { data: sessions, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }

  // For each session, get last message and unread count
  const enriched = await Promise.all(
    (sessions || []).map(async (session) => {
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, role, created_at")
        .eq("session_id", session.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", session.id)
        .eq("role", "user")
        .eq("is_seen", false);

      return {
        ...session,
        lastMessage: lastMsg?.content || "",
        lastMessageRole: lastMsg?.role || "",
        lastMessageAt: lastMsg?.created_at || session.created_at,
        unreadCount: unreadCount || 0,
      };
    })
  );

  return Response.json({ sessions: enriched });
}
