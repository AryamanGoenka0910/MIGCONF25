import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { DirectoryUser } from "@/lib/types";
import { jsonError, requireAuthUser } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;
  
  const { searchParams } = new URL(request.url);
  const includeTeamed = searchParams.get("includeTeamed") === "true";
  
  type UserDirectoryRow = {
    user_id: string;
    user_email: string | null;
    user_name: string | null;
    team_id: number | null;
  };
  
  let data: UserDirectoryRow[] = [];
  let error: { message: string } | null = null;

  if (includeTeamed) {
    const result = await supabaseAdmin
      .from("Users")
      .select("user_id, user_email, user_name, team_id")
      .not("team_id", "is", null)
      .neq("user_id", auth.user.id)
      .order("user_name", { ascending: true })
      .limit(5000);

    data = result.data ?? [];
    error = result.error;
  } else {
    // Only return users who are not already in a team.
    // This relies on the trigger that mirrors auth.users into public."Users" with a nullable team_id.
    const result = await supabaseAdmin
      .from("Users")
      .select("user_id, user_email, user_name, team_id")
      .is("team_id", null)
      .neq("user_id", auth.user.id)
      .order("user_name", { ascending: true })
      .limit(5000);

    data = result.data ?? [];
    error = result.error;
  }
  

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

