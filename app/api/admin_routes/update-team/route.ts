import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireAdmin } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const { team_id, team_name, game_1_score, game_2_score, game_3_score, game_4_score, algo_score } =
    body as Record<string, unknown>;

  if (typeof team_id !== "number" && typeof team_id !== "string") {
    return jsonError(400, "Missing team_id.");
  }
  const teamIdNum = Number(team_id);
  if (!Number.isFinite(teamIdNum)) return jsonError(400, "Invalid team_id.");

  const toNullableNum = (v: unknown) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const updates: Record<string, unknown> = {
    team_name: typeof team_name === "string" ? team_name || null : null,
    game_1_score: toNullableNum(game_1_score),
    game_2_score: toNullableNum(game_2_score),
    game_3_score: toNullableNum(game_3_score),
    game_4_score: toNullableNum(game_4_score),
    algo_score: toNullableNum(algo_score),
  };

  const { error } = await supabaseAdmin
    .from("Teams")
    .update(updates)
    .eq("team_id", teamIdNum);

  if (error) {
    return jsonError(500, `Failed to update team: ${error.message}`);
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
