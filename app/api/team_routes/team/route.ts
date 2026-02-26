import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { User } from "@/lib/types";

export const runtime = "nodejs";

type MemberApplicationStatus = "confirmed" | "pending";
type TeamMember = User & { status: MemberApplicationStatus };

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
    .select("user_id, user_email, user_name, team_id, role")
    .eq("team_id", teamId)
    .order("user_name", { ascending: true });

  if (membersError) {
    return jsonError(500, `Failed to load team members: ${membersError.message}`);
  }

  const members = (memberRows ?? []) as unknown as User[];

  const memberIds = members.map((m) => m.user_id);
  let submittedUserIds = new Set<string>();

  if (memberIds.length > 0) {
    const { data: applicationRows, error: applicationError } = await supabaseAdmin
      .from("Applications")
      .select("user_id, submitted_at")
      .in("user_id", memberIds);

    if (applicationError) {
      return jsonError(500, `Failed to load team applications: ${applicationError.message}`);
    }

    const rows = (applicationRows ?? []) as unknown as { user_id: string; submitted_at: string | null }[];
    submittedUserIds = new Set(rows.filter((r) => !!r.submitted_at).map((r) => r.user_id));
  }

  const membersWithStatus: TeamMember[] = members.map((m) => {
    return {
      ...m,
      status: submittedUserIds.has(m.user_id) ? "confirmed" : "pending",
    };
  });

  return NextResponse.json(
    {
      team: {
        team_id: teamId,
        members: membersWithStatus,
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

