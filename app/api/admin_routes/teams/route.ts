import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireAdmin } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const [{ data: teams, error: teamsError }, { data: users, error: usersError }, { data: apps, error: appsError }] =
    await Promise.all([
      supabaseAdmin.from("Teams").select("team_id, teammember_ids, team_name, game_1_score, game_2_score, game_3_score, game_4_score, algo_score").order("team_id", { ascending: true }),
      supabaseAdmin.from("Users").select("user_id, team_id, user_name, user_email, status"),
      supabaseAdmin.from("Applications").select("user_id, school, major, grad_year, travel_reimbursement, trading_experience, submitted_at"),
    ]);

  if (teamsError) return jsonError(500, teamsError.message);
  if (usersError) return jsonError(500, usersError.message);
  if (appsError) return jsonError(500, appsError.message);

  // Build lookup maps keyed by lowercase UUID
  const userMap: Record<string, { user_id: string; team_id: string | null; user_name: string; user_email: string; status: string | null }> = {};
  for (const u of users ?? []) {
    userMap[String(u.user_id).toLowerCase()] = {
      user_id: String(u.user_id),
      team_id: String(u.team_id ?? null),
      user_name: String(u.user_name ?? ""),
      user_email: String(u.user_email ?? ""),
      status: (u.status as string | null) ?? null,
    };
  }

  const appMap: Record<string, typeof apps extends (infer T)[] | null ? T : never> = {};
  for (const a of apps ?? []) {
    appMap[String(a.user_id).toLowerCase()] = a;
  }

  const result = (teams ?? []).map((t) => {
    const uuids: string[] = Array.isArray(t.teammember_ids) ? (t.teammember_ids as string[]) : [];

    const members = uuids.map((uuid) => {
      const key = String(uuid).toLowerCase();
      const u = userMap[key] ?? null;
      const a = appMap[key] ?? null;
      return {
        user_id: uuid,
        team_id: u?.team_id != null ? Number(u.team_id) : null,
        user_name: u?.user_name ?? `[unknown: ${uuid}]`,
        user_email: u?.user_email ?? "",
        status: u?.status ?? null,
        application: a
          ? {
              school: String(a.school ?? ""),
              major: String(a.major ?? ""),
              grad_year: String(a.grad_year ?? ""),
              travel_reimbursement: Boolean(a.travel_reimbursement),
              trading_experience: Boolean(a.trading_experience),
              submitted_at: (a.submitted_at as string | null) ?? null,
            }
          : null,
      };
    });

    return {
      team_id: Number(t.team_id),
      team_name: (t as Record<string, unknown>).team_name as string | null ?? null,
      game_1_score: (t as Record<string, unknown>).game_1_score as number | null ?? null,
      game_2_score: (t as Record<string, unknown>).game_2_score as number | null ?? null,
      game_3_score: (t as Record<string, unknown>).game_3_score as number | null ?? null,
      game_4_score: (t as Record<string, unknown>).game_4_score as number | null ?? null,
      algo_score: (t as Record<string, unknown>).algo_score as number | null ?? null,
      members,
    };
  });

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
