import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { invite_id?: unknown }
    | null;

  if (!body || (typeof body.invite_id !== "string")) {
    return jsonError(400, "Invalid request body.");
  }

  // 1) Load the invite and ensure the authed user is the recipient.
  const { data: inviteRow, error: inviteError } = await supabaseAdmin
    .from("Invites")
    .select("invite_id, team_id, to_user_id, status")
    .eq("invite_id", body.invite_id)
    .maybeSingle();

  if (inviteError) {
    return jsonError(500, `Failed to load invite: ${inviteError.message}`);
  }
  if (!inviteRow) {
    return jsonError(404, "Invite not found.");
  }

  const invite = inviteRow as unknown as {
    invite_id: string | number;
    team_id: number;
    to_user_id: string;
    status: string;
  };

  if (invite.to_user_id !== auth.user.id) {
    return jsonError(403, "You are not allowed to accept this invite.");
  }
  if (invite.status !== "pending") {
    return jsonError(400, `Invite is not pending (status: ${invite.status}).`);
  }

  // 2) Check that the team exists and has space.
  const MAX_TEAM_SIZE = 4;

  const { data: teamRow, error: teamError } = await supabaseAdmin
    .from("Teams")
    .select("team_id, teammember_ids")
    .eq("team_id", invite.team_id)
    .maybeSingle();

  if (teamError) {
    return jsonError(500, `Failed to load team: ${teamError.message}`);
  }
  if (!teamRow) {
    return jsonError(404, "Team not found.");
  }

  const existingMemberIds = ((teamRow as { teammember_ids?: unknown } | null)?.teammember_ids ??
    []) as unknown as string[];
  const memberSet = new Set<string>((existingMemberIds ?? []).filter(Boolean));
  memberSet.add(auth.user.id);
  const nextMemberIds = Array.from(memberSet);

  if (nextMemberIds.length > MAX_TEAM_SIZE) {
    return jsonError(400, "Team is full.");
  }

  // 3) Add user to team (update Teams.teammember_ids).
  const { error: updateTeamError } = await supabaseAdmin
    .from("Teams")
    .update({ teammember_ids: nextMemberIds })
    .eq("team_id", invite.team_id);

  if (updateTeamError) {
    return jsonError(500, `Failed to update team members: ${updateTeamError.message}`);
  }

  // 4) Update the user's team_id.
  const { error: updateUserError } = await supabaseAdmin
    .from("Users")
    .update({ team_id: invite.team_id })
    .eq("user_id", auth.user.id);

  if (updateUserError) {
    return jsonError(500, `Failed to assign team to user: ${updateUserError.message}`);
  }

  // 5) Mark invite accepted.
  const { error: acceptInviteError } = await supabaseAdmin
    .from("Invites")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("invite_id", invite.invite_id)
    .eq("to_user_id", auth.user.id);

  if (acceptInviteError) {
    return jsonError(500, `Failed to accept invite: ${acceptInviteError.message}`);
  }

  return NextResponse.json(
    { ok: true, team_id: invite.team_id },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

