import { createServerClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { name, phone, password } = await request.json();

    if (!name?.trim() || !phone?.trim() || !password?.trim()) {
      return Response.json({ error: "Name, phone, and password are required" }, { status: 400 });
    }

    if (password.length < 4) {
      return Response.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if phone already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone.trim())
      .single();

    if (existing) {
      return Response.json({ error: "Phone number already registered. Please login." }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: userErr } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        password_hash: passwordHash,
        role: 'user', // Explicitly set role
      })
      .select("id, name, phone, role")
      .single();

    if (userErr || !user) {
      console.error("Signup error:", userErr);
      return Response.json({ error: "Failed to create account" }, { status: 500 });
    }

    // Set auth cookie
    const token = Buffer.from(JSON.stringify({ userId: user.id, phone: user.phone })).toString("base64");
    const cookieStore = await cookies();
    cookieStore.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return Response.json({ user: { id: user.id, name: user.name, phone: user.phone } });
  } catch {
    return Response.json({ error: "Signup failed" }, { status: 500 });
  }
}
