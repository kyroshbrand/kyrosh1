import { cookies } from "next/headers";

/**
 * Verify admin auth cookie. Returns true if valid.
 * This is used in API routes to protect sensitive operations.
 */
export async function verifyAdmin(): Promise<boolean> {
  try {
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    
    if (!adminUser || !adminPass) {
      console.error("Admin credentials not configured in .env");
      return false;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    
    if (!token) return false;

    // The token is base64 encoded "username:password"
    const expected = Buffer.from(`${adminUser}:${adminPass}`).toString("base64");
    
    // Constant time-ish comparison would be better, but this is simple basic auth for now
    return token === expected;
  } catch (error) {
    console.error("Auth verification error:", error);
    return false;
  }
}
