import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "";

// Client-side Supabase (uses anon key, safe for browser)
export function createBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null as never;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Server-side Supabase (uses service role key, full access)
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !serviceKey) return null as never;
  return createClient(SUPABASE_URL, serviceKey);
}
