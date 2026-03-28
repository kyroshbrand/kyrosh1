import { cookies } from "next/headers";

/**
 * Verify admin auth cookie. Returns true if valid.
 */
export async function verifyAdmin(): Promise<boolean> {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminUser || !adminPass) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;

  const expected = Buffer.from(`${adminUser}:${adminPass}`).toString("base64");
  return token === expected;
}
