import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { InviteUserRow, Invite } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const table = "Invites";

    const { data: sentInviteData, error: sentInviteError } = await supabaseAdmin
        .from(table)
        .select("invite_id, from_user_id, to_user_id, team_id, status, created_at, updated_at")
        .eq("from_user_id", auth.user.id)
        .eq("status", "pending");


    if (sentInviteError) {
        return jsonError(500, `Failed to load sent invites: ${sentInviteError.message}`);
    }
    type InviteRow = Omit<Invite, "to_user" | "from_user">;
    const sentInvites = (sentInviteData ?? []) as unknown as InviteRow[];

    const { data: receivedInviteData, error: receivedInviteError } = await supabaseAdmin
        .from(table)
        .select("invite_id, from_user_id, to_user_id, team_id, status, created_at, updated_at")
        .eq("to_user_id", auth.user.id)
        .eq("status", "pending");

    if (receivedInviteError) {
        return jsonError(500, `Failed to load received invites: ${receivedInviteError.message}`);
    }
    const receivedInvites = (receivedInviteData ?? []) as unknown as InviteRow[];

    // Hydrate invites with user data (outgoing: to_user, incoming: from_user).
    const counterpartUserIds = Array.from(
        new Set<string>([
            ...sentInvites.map((i) => i.to_user_id),
            ...receivedInvites.map((i) => i.from_user_id),
        ])
    ).filter(Boolean);

    const usersById = new Map<string, InviteUserRow>();
    if (counterpartUserIds.length > 0) {
        const { data: userRows, error: usersError } = await supabaseAdmin
            .from("Users")
            .select("user_id, user_email, user_name, team_id, role")
            .in("user_id", counterpartUserIds);

        if (usersError) {
            return jsonError(500, `Failed to load invite users: ${usersError.message}`);
        }

        for (const row of (userRows ?? []) as InviteUserRow[]) {
            if (row?.user_id) usersById.set(row.user_id, row);
        }
    }

    const sent_invites: Invite[] = sentInvites.map((invite) => ({
        ...invite,
        to_user: usersById.get(invite.to_user_id) ?? null,
    }));

    const received_invites: Invite[] = receivedInvites.map((invite) => ({
        ...invite,
        from_user: usersById.get(invite.from_user_id) ?? null,
    }));

    return NextResponse.json(
        { 
            sent_invites,
            received_invites,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
    );
}

