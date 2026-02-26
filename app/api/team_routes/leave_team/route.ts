import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

  // Load current team id.
  const { data: userRow, error: userError } = await supabaseAdmin
    .from("Users")
    .select("team_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (userError) {
    return jsonError(500, `Failed to load user: ${userError.message}`);
  }
  if (!userRow) {
    return jsonError(404, "User profile not found.");
  }

  const currentTeamId = (userRow as { team_id?: unknown } | null)?.team_id as number | null;
  if (currentTeamId === null) {
    return jsonError(400, "You are not currently in a team.");
  }

  // Load current team member ids.
  const { data: teamRow, error: teamError } = await supabaseAdmin
    .from("Teams")
    .select("team_id, teammember_ids")
    .eq("team_id", currentTeamId)
    .maybeSingle();

  if (teamError) {
    return jsonError(500, `Failed to load team: ${teamError.message}`);
  }
  if (!teamRow) {
    return jsonError(404, "Team not found.");
  }

  const originalMemberIds = (((teamRow as { teammember_ids?: unknown } | null)?.teammember_ids ?? []) as unknown as string[])
    .filter(Boolean);
  const remainingMemberIds = originalMemberIds.filter((id) => id !== auth.user.id);

  // Create a new team with only the leaving user.
  const { data: newTeamRow, error: newTeamError } = await supabaseAdmin
    .from("Teams")
    .insert({ teammember_ids: [auth.user.id] })
    .select("team_id")
    .single();

  if (newTeamError) {
    return jsonError(500, `Failed to create new team: ${newTeamError.message}`);
  }

  const newTeamId = (newTeamRow as { team_id?: unknown } | null)?.team_id ?? null;
  if (typeof newTeamId !== "number" || !Number.isInteger(newTeamId)) {
    return jsonError(500, "Failed to create new team: missing team_id in inserted row.");
  }

  // Remove user from old team. If it becomes empty, delete the team row.
  if (remainingMemberIds.length === 0) {
    const { error: deleteTeamError } = await supabaseAdmin
      .from("Teams")
      .delete()
      .eq("team_id", currentTeamId);

    if (deleteTeamError) {
      // Best-effort cleanup: remove the newly created team so we don't create a dangling team on failure.
      await supabaseAdmin.from("Teams").delete().eq("team_id", newTeamId);
      return jsonError(500, `Failed to delete old team: ${deleteTeamError.message}`);
    }
  } else {
    const { error: updateOldTeamError } = await supabaseAdmin
      .from("Teams")
      .update({ teammember_ids: remainingMemberIds })
      .eq("team_id", currentTeamId);

    if (updateOldTeamError) {
      await supabaseAdmin.from("Teams").delete().eq("team_id", newTeamId);
      return jsonError(500, `Failed to update old team: ${updateOldTeamError.message}`);
    }
  }

  // Update user's team_id to the new team.
  const { error: updateUserError } = await supabaseAdmin
    .from("Users")
    .update({ team_id: newTeamId })
    .eq("user_id", auth.user.id);

  if (updateUserError) {
    // Best-effort rollback.
    await supabaseAdmin.from("Teams").delete().eq("team_id", newTeamId);
    await supabaseAdmin.from("Teams").update({ teammember_ids: originalMemberIds }).eq("team_id", currentTeamId);
    return jsonError(500, `Failed to update user team: ${updateUserError.message}`);
  }

  return NextResponse.json(
    { ok: true, previous_team_id: currentTeamId, team_id: newTeamId },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

