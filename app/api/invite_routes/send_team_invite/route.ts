import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type SendTeamInviteRequest = {
  from_user_id: string;
  to_user_id: string;
  team_id: number;
  status: "pending" | "accepted" | "rejected";
  created_at?: string;
  updated_at: string | null;
};

export async function POST(request: Request) {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json().catch(() => null)) as
    | { to_user_id?: unknown; team_id?: unknown }
    | null;

    if (!body || typeof body.to_user_id !== "string" || typeof body.team_id !== "number") {
    return jsonError(400, "Invalid request body.");
    }

    const MAX_TEAM_SIZE = 4;
    // 1) Check that the team exists and has space.
    const { data: teamRow, error: teamError } = await supabaseAdmin
        .from("Teams")
        .select("team_id, teammember_ids")
        .eq("team_id", body.team_id)
        .maybeSingle();

    if (teamError) {
        return jsonError(500, `Failed to load team: ${teamError.message}`);
    }
    if (!teamRow) {
        return jsonError(404, "Team not found.");
    }

    const team = teamRow as unknown as {
        team_id: number;
        teammember_ids: string[];
    };

    if (team.teammember_ids.length >= MAX_TEAM_SIZE) {
        return jsonError(400, "Team is already at maximum capacity.");
    }

    const payload: SendTeamInviteRequest = {
        from_user_id: auth.user.id,
        to_user_id: body.to_user_id,
        team_id: body.team_id,
        status: "pending",
        updated_at: null,
    };

    const { data: inviteData, error: inviteError } = await supabaseAdmin
        .from("Invites")
        .insert(payload)
        .select("invite_id")
        .single();


    if (inviteError) {
        return jsonError(500, `Failed to create invite: ${inviteError.message}`);
    }

    if (!inviteData) {
        return jsonError(404, "User profile not found.");
    }

    return NextResponse.json(
        { invite: inviteData },
        { status: 200, headers: { "Cache-Control": "no-store" } }
    );
}

