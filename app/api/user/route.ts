import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { User } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

  const { data: userRow, error: userError } = await supabaseAdmin
    .from("Users")
    .select("user_id, user_email, user_name, team_id, role")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (userError) {
    return jsonError(500, `Failed to load user: ${userError.message}`);
  }
  if (!userRow) {
    return jsonError(404, "User profile not found.");
  }

  const user = userRow as unknown as User;

  return NextResponse.json(
    { user: user, },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

