import { createServerClient } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return Response.json({ error: "Session ID required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Mark all user messages in this session as seen
    const { error } = await supabase
      .from("messages")
      .update({ is_seen: true })
      .eq("session_id", sessionId)
      .eq("role", "user")
      .eq("is_seen", false);

    if (error) {
      return Response.json({ error: "Failed to mark as seen" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to mark seen" }, { status: 500 });
  }
}
