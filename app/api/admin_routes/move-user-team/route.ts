import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireAdmin } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: { user_id?: unknown; target_team_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const userId = typeof body.user_id === "string" ? body.user_id : null;
  if (!userId) return jsonError(400, "Missing user_id.");

  // Supabase returns int8 (bigint) columns as strings — coerce to number or null
  const rawTarget = body.target_team_id;
  const targetTeamId =
    rawTarget === null || rawTarget === undefined
      ? null
      : Number.isFinite(Number(rawTarget))
      ? Number(rawTarget)
      : null;
  // null means create a new solo team; number means move to existing team

  // Load user's current team_id
  const { data: userRow, error: userError } = await supabaseAdmin
    .from("Users")
    .select("team_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (userError) return jsonError(500, `Failed to load user: ${userError.message}`);
  if (!userRow) return jsonError(404, "User not found.");

  const rawCurrent = (userRow as { team_id?: unknown }).team_id;
  const currentTeamId = rawCurrent == null ? null : Number(rawCurrent);

  // Determine the new team id
  let newTeamId: number;

  if (targetTeamId === null) {
    // Create a new solo team
    const { data: newTeam, error: newTeamError } = await supabaseAdmin
      .from("Teams")
      .insert({ teammember_ids: [userId] })
      .select("team_id")
      .single();

    if (newTeamError) return jsonError(500, `Failed to create solo team: ${newTeamError.message}`);
    const created = (newTeam as { team_id?: unknown }).team_id;
    const createdNum = Number(created);
    if (!Number.isFinite(createdNum)) return jsonError(500, "Failed to create solo team: no team_id returned.");
    newTeamId = createdNum;
  } else {
    newTeamId = targetTeamId;
  }

  // Remove user from old team (if they had one)
  if (currentTeamId !== null && currentTeamId !== newTeamId) {
    const { data: oldTeamRow, error: oldTeamError } = await supabaseAdmin
      .from("Teams")
      .select("teammember_ids")
      .eq("team_id", currentTeamId)
      .maybeSingle();

    if (oldTeamError) return jsonError(500, `Failed to load old team: ${oldTeamError.message}`);

    if (oldTeamRow) {
      const oldMembers = ((oldTeamRow as { teammember_ids?: unknown }).teammember_ids as string[] ?? []).filter(Boolean);
      const remaining = oldMembers.filter((id) => id !== userId);

      if (remaining.length === 0) {
        const { error: deleteError } = await supabaseAdmin
          .from("Teams")
          .delete()
          .eq("team_id", currentTeamId);
        if (deleteError) return jsonError(500, `Failed to delete empty team: ${deleteError.message}`);
      } else {
        const { error: updateOldError } = await supabaseAdmin
          .from("Teams")
          .update({ teammember_ids: remaining })
          .eq("team_id", currentTeamId);
        if (updateOldError) return jsonError(500, `Failed to update old team: ${updateOldError.message}`);
      }
    }
  }

  // Add user to new existing team (skip if we just created a solo team — already done during insert)
  if (targetTeamId !== null) {
    const { data: newTeamRow, error: newTeamFetchError } = await supabaseAdmin
      .from("Teams")
      .select("teammember_ids")
      .eq("team_id", newTeamId)
      .maybeSingle();

    if (newTeamFetchError) return jsonError(500, `Failed to load target team: ${newTeamFetchError.message}`);
    if (!newTeamRow) return jsonError(404, "Target team not found.");

    const existingMembers = ((newTeamRow as { teammember_ids?: unknown }).teammember_ids as string[] ?? []).filter(Boolean);
    if (!existingMembers.includes(userId)) {
      const { error: updateNewError } = await supabaseAdmin
        .from("Teams")
        .update({ teammember_ids: [...existingMembers, userId] })
        .eq("team_id", newTeamId);
      if (updateNewError) return jsonError(500, `Failed to update target team: ${updateNewError.message}`);
    }
  }

  // Update user's team_id
  const { error: updateUserError } = await supabaseAdmin
    .from("Users")
    .update({ team_id: newTeamId })
    .eq("user_id", userId);

  if (updateUserError) return jsonError(500, `Failed to update user team: ${updateUserError.message}`);

  return NextResponse.json(
    { ok: true, new_team_id: newTeamId },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
