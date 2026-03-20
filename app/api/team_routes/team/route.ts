import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { TeamMember, TeamMemberStatus } from "@/lib/types";

export const runtime = "nodejs";

function toMemberStatus(status: string | null): TeamMemberStatus {
  if (status === "app_accepted") return "accepted";
  if (status === "app_rejected") return "rejected";
  if (status === "rsvp_confirmed") return "rsvped";
  if (status === "checked_in") return "checked_in";
  return "pending";
}

export async function GET(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

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

  const teamId = (userRow as { team_id?: unknown } | null)?.team_id as number | null;
  if (teamId === null) {
    return NextResponse.json({ team: null }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }

  const { data: memberRows, error: membersError } = await supabaseAdmin
    .from("Users")
    .select("user_id, user_email, user_name, team_id, role, status")
    .eq("team_id", teamId)
    .order("user_name", { ascending: true });

  if (membersError) {
    return jsonError(500, `Failed to load team members: ${membersError.message}`);
  }

  const membersWithStatus: TeamMember[] = (memberRows ?? []).map((m) => ({
    ...m,
    status: toMemberStatus(m.status ?? null),
  }));

   const { data: teamData, error: teamError } = await supabaseAdmin
    .from("Teams")
    .select("team_id, team_name")
    .eq("team_id", teamId)
    .single();

  if (teamError) {
    return jsonError(500, `Failed to load team members: ${teamError.message}`);
  } 

  return NextResponse.json(
    {
      team: {
        team_id: teamId,
        team_name: teamData?.team_name ?? null,
        members: membersWithStatus,
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
