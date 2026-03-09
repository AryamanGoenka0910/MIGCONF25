import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireAdmin } from "@/app/api/_utils";

export const runtime = "nodejs";

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
    .select("user_id, status, travel_budget")
    .in("user_id", userIds)
    .not("status", "is", null);

  if (usersError) {
    return jsonError(500, `Failed to fetch user statuses: ${usersError.message}`);
  }

  const userMap = Object.fromEntries(
    (users ?? []).map((u: { user_id: string; status: string | null; travel_budget: number | null }) => [
      u.user_id,
      { status: u.status, travel_budget: u.travel_budget ?? 0 },
    ])
  );

  const merged = (apps ?? []).map((a: { user_id: string }) => ({
    ...a,
    status: userMap[a.user_id]?.status ?? null,
    travel_budget: userMap[a.user_id]?.travel_budget ?? 0,
  }));

  return NextResponse.json(merged, {
    headers: { "Cache-Control": "no-store" },
  });
}
