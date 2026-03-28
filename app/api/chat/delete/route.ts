import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return Response.json({ error: "Session ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const userId = decoded.userId;

    const supabase = createServerClient();

    // Verify session belongs to user
    const { data: session } = await supabase
      .from("chat_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (!session || session.user_id !== userId) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete session (messages cascade)
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return Response.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
