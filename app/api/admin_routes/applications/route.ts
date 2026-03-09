import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireAdmin } from "@/app/api/_utils";

export const runtime = "nodejs";

type UserRow = { user_id: string; status: string | null; travel_budget: number | null; team_id: number | null };
type TeamRow = { team_id: number; teammember_ids: string[] | null };
type MemberUserRow = { user_id: string; user_name: string; user_email: string; status: string | null };

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data: apps, error: appsError } = await supabaseAdmin
    .from("Applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (appsError) {
    return jsonError(500, `Failed to fetch applications: ${appsError.message}`);
  }

  const userIds = [...new Set((apps ?? []).map((a: { user_id: string }) => a.user_id))];

  const { data: users, error: usersError } = await supabaseAdmin
    .from("Users")
    .select("user_id, status, travel_budget, team_id")
    .in("user_id", userIds);

  if (usersError) {
    return jsonError(500, `Failed to fetch user statuses: ${usersError.message}`);
  }

  const userMap = Object.fromEntries(
    (users ?? []).map((u: UserRow) => [
      u.user_id,
      { status: u.status, travel_budget: u.travel_budget ?? 0, team_id: u.team_id ?? null },
    ])
  );

  // Fetch team member data
  const teamIds = [...new Set(
    Object.values(userMap)
      .map((u) => u.team_id)
      .filter((id): id is number => id !== null)
  )];

  let teamMap: Record<number, string[]> = {};
  let memberUserMap: Record<string, { user_name: string; user_email: string; status: string | null }> = {};

  if (teamIds.length > 0) {
    const { data: teams, error: teamsError } = await supabaseAdmin
      .from("Teams")
      .select("team_id, teammember_ids")
      .in("team_id", teamIds);

    if (teamsError) {
      return jsonError(500, `Failed to fetch teams: ${teamsError.message}`);
    }

    teamMap = Object.fromEntries(
      (teams ?? []).map((t: TeamRow) => [t.team_id, t.teammember_ids ?? []])
    );

    const allMemberIds = [...new Set((teams ?? []).flatMap((t: TeamRow) => t.teammember_ids ?? []))];

    if (allMemberIds.length > 0) {
      const { data: memberUsers, error: memberUsersError } = await supabaseAdmin
        .from("Users")
        .select("user_id, user_name, user_email, status")
        .in("user_id", allMemberIds);

      if (memberUsersError) {
        return jsonError(500, `Failed to fetch team members: ${memberUsersError.message}`);
      }

      memberUserMap = Object.fromEntries(
        (memberUsers ?? []).map((u: MemberUserRow) => [
          u.user_id,
          { user_name: u.user_name, user_email: u.user_email, status: u.status },
        ])
      );
    }
  }

  const merged = (apps ?? []).map((a: { user_id: string }) => {
    const userInfo = userMap[a.user_id] ?? { status: null, travel_budget: 0, team_id: null };
    const teamId = userInfo.team_id;
    const memberIds = teamId !== null ? (teamMap[teamId] ?? []) : [];
    const teammates = memberIds
      .filter((id) => id !== a.user_id)
      .map((id) => ({
        user_id: id,
        user_name: memberUserMap[id]?.user_name ?? "Unknown",
        user_email: memberUserMap[id]?.user_email ?? "",
        status: memberUserMap[id]?.status ?? null,
      }));

    return {
      ...a,
      status: userInfo.status ?? null,
      travel_budget: userInfo.travel_budget ?? 0,
      team_id: teamId,
      teammates,
    };
  });

  return NextResponse.json(merged, {
    headers: { "Cache-Control": "no-store" },
  });
}
