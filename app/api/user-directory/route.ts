import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { DirectoryUser } from "@/lib/types";

export const runtime = "nodejs";

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim() || null;
}

function buildFullName(userMetadata: Record<string, unknown> | null | undefined) {
  const md = userMetadata ?? {};
  const fullName = typeof md.full_name === "string" ? md.full_name.trim() : "";
  if (fullName) return fullName;

  const first = typeof md.first_name === "string" ? md.first_name.trim() : "";
  const last = typeof md.last_name === "string" ? md.last_name.trim() : "";
  const combined = `${first} ${last}`.trim();
  return combined || null;
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError(500, "Missing Supabase env.");
  }

  const token = getBearerToken(request);
  if (!token) {
    return jsonError(401, "Missing auth token.");
  }

  // Verify the caller is authenticated (so this endpoint isn't publicly enumerable).
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    return jsonError(401, "Unauthorized.");
  }

  const perPage = 1000;
  const maxUsers = 20000; // safety cap
  const users: DirectoryUser[] = [];

  // Supabase uses 1-based pages for listUsers.
  for (let page = 1; users.length < maxUsers; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      return jsonError(500, "Failed to list users.");
    }

    const batch = (data?.users ?? []).map((u) => {
      return {
        id: u.id,
        email: u.email ?? "",
        full_name: buildFullName((u.user_metadata ?? {}) as Record<string, unknown>),
      } satisfies DirectoryUser;
    });

    users.push(...batch.filter((u) => u.email));

    if ((data?.users?.length ?? 0) < perPage) break;
  }

  return NextResponse.json(
    { users },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

