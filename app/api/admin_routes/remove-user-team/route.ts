import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireAdmin } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: { user_id?: unknown; team_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const userId = typeof body.user_id === "string" ? body.user_id : null;
  if (!userId) return jsonError(400, "Missing user_id.");

  const rawTeamId = body.team_id;
  const teamId =
    rawTeamId !== null && rawTeamId !== undefined && Number.isFinite(Number(rawTeamId))
      ? Number(rawTeamId)
      : null;
  if (teamId === null) return jsonError(400, "Missing or invalid team_id.");

  // Load the team
  const { data: teamRow, error: teamError } = await supabaseAdmin
    .from("Teams")
    .select("teammember_ids")
    .eq("team_id", teamId)
    .maybeSingle();

  if (teamError) return jsonError(500, `Failed to load team: ${teamError.message}`);
  if (!teamRow) return jsonError(404, "Team not found.");

  const members = ((teamRow as { teammember_ids?: unknown }).teammember_ids as string[] ?? []).filter(Boolean);
  const remaining = members.filter((id) => id !== userId);

  if (remaining.length === 0) {
    const { error: deleteError } = await supabaseAdmin
      .from("Teams")
      .delete()
      .eq("team_id", teamId);
    if (deleteError) return jsonError(500, `Failed to delete empty team: ${deleteError.message}`);
  } else {
    const { error: updateError } = await supabaseAdmin
      .from("Teams")
      .update({ teammember_ids: remaining })
      .eq("team_id", teamId);
    if (updateError) return jsonError(500, `Failed to update team: ${updateError.message}`);
  }

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
