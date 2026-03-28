import { createServerClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone?.trim() || !password?.trim()) {
      return Response.json({ error: "Phone and password are required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Find user by phone
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, phone, password_hash")
      .eq("phone", phone.trim())
      .single();

    if (error || !user) {
      return Response.json({ error: "Account not found. Please sign up." }, { status: 404 });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    // Set auth cookie
    const token = Buffer.from(JSON.stringify({ userId: user.id, phone: user.phone })).toString("base64");
    const cookieStore = await cookies();
    cookieStore.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return Response.json({ user: { id: user.id, name: user.name, phone: user.phone } });
  } catch {
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
