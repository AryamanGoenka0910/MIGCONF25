import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireAuthUser } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

  const { data: userData, error: userError } = await supabaseAdmin
    .from("Users")
    .select("role, status")
    .eq("user_id", auth.user.id)
    .single();

  if (userError || !userData) {
    return jsonError(403, "Forbidden.");
  }

  const { role, status } = userData as { role: string; status: string | null };
  const allowed =
    role === "Admin" || role === "Sponsor" || status === "checked_in";

  if (!allowed) {
    return jsonError(403, "Forbidden.");
  }

  const { data: teams, error: teamsError } = await supabaseAdmin
    .from("Teams")
    .select(
      "team_id, team_name, game_1_score, game_2_score, game_3_score, game_4_score, algo_score"
    )
    .not("team_name", "is", null)
    .order("team_id", { ascending: true });

  if (teamsError) return jsonError(500, teamsError.message);

  return NextResponse.json(teams ?? [], {
    headers: { "Cache-Control": "no-store" },
  });
}
