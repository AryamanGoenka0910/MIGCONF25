import { NextResponse } from "next/server";
import { createClient, type User as SupabaseUser } from "@supabase/supabase-js";

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim() || null;
}

export function getSupabasePublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { supabaseUrl, supabaseAnonKey };
}

export async function requireAuthUser(request: Request): Promise<
  | { ok: true; user: SupabaseUser; token: string }
  | { ok: false; response: NextResponse }
> {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, response: jsonError(500, "Missing Supabase env.") };
  }

  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, response: jsonError(401, "Missing auth token.") };
  }

  // Verify the caller is authenticated.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    return { ok: false, response: jsonError(401, "Unauthorized.") };
  }

  return { ok: true, user: authData.user, token };
}