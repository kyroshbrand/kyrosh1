import { createServerClient } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, connect } = await request.json();

    if (!sessionId || typeof connect !== "boolean") {
      return Response.json({ error: "Session ID and connect flag required" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("chat_sessions")
      .update({ is_human_connected: connect })
      .eq("id", sessionId);

    if (error) {
      return Response.json({ error: "Failed to update" }, { status: 500 });
    }

    return Response.json({ success: true, is_human_connected: connect });
  } catch {
    return Response.json({ error: "Failed to toggle" }, { status: 500 });
  }
}
