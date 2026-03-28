import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      return Response.json({ error: "Admin credentials not configured" }, { status: 500 });
    }

    if (username !== adminUser || password !== adminPass) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set a simple auth cookie (base64 encoded for basic obfuscation)
    const token = Buffer.from(`${adminUser}:${adminPass}`).toString("base64");

    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
