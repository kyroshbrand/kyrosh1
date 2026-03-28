import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";

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
    const userId = await getCurrentUser();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return Response.json({ error: "Session ID required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify session belongs to user
    const { data: session } = await supabase
      .from("chat_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (!session || session.user_id !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark bot and admin messages as seen
    const { error } = await supabase
      .from("messages")
      .update({ is_seen: true })
      .eq("session_id", sessionId)
      .in("role", ["bot", "admin"])
      .eq("is_seen", false);

    if (error) {
       console.error("Mark seen error:", error);
       return Response.json({ error: "Failed to mark as seen" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Mark seen catch error:", error);
    return Response.json({ error: "Failed to mark seen" }, { status: 500 });
  }
}
