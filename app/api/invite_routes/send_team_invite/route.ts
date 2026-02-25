import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type SendTeamInviteRequest = {
  from_user_id: string;
  to_user_id: string;
  team_id: number;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string | null;
};

export async function POST(request: Request) {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const table = "Invites";

    const body = (await request.json().catch(() => null)) as
    | { to_user_id?: unknown; team_id?: unknown }
    | null;

    if (!body || typeof body.to_user_id !== "string" || typeof body.team_id !== "number") {
    return jsonError(400, "Invalid request body.");
    }

    const payload: SendTeamInviteRequest = {
        from_user_id: auth.user.id,
        to_user_id: body.to_user_id,
        team_id: body.team_id,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: null,
    };

    const { data: inviteData, error: inviteError } = await supabaseAdmin
        .from(table)
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

