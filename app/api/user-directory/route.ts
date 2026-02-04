import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { DirectoryUser } from "@/lib/types";
import { jsonError, requireAuthUser } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

  // Only return users who are not already in a team.
  // This relies on the trigger that mirrors auth.users into public."Users" with a nullable team_id.
  const { data, error } = await supabaseAdmin
    .from("Users")
    .select("user_id, user_email, user_name, team_id")
    .is("team_id", null)
    .neq("user_id", auth.user.id)
    .order("user_name", { ascending: true })
    .limit(5000);

  if (error) {
    return jsonError(500, `Failed to load user directory: ${error.message}`);
  }

  const users: DirectoryUser[] = (data ?? [])
    .map((row) => ({
      id: row.user_id as string,
      email: (row.user_email as string) ?? "",
      full_name: ((row.user_name as string) || "").trim() || null,
    }))
    .filter((u) => u.email);

  return NextResponse.json(
    { users },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

