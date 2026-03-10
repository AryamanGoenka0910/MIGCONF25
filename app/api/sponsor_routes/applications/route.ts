import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireSponsor } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireSponsor(request);
  if (!auth.ok) return auth.response;

  const { data: apps, error: appsError } = await supabaseAdmin
    .from("Applications")
    .select("application_id, user_id, user_name, user_email, school, major, grad_year, submitted_at")
    .order("submitted_at", { ascending: false });

  if (appsError) {
    return jsonError(500, `Failed to fetch applications: ${appsError.message}`);
  }

  const userIds = [...new Set((apps ?? []).map((a: { user_id: string }) => a.user_id))];

  const { data: users, error: usersError } = await supabaseAdmin
    .from("Users")
    .select("user_id, status")
    .in("user_id", userIds);

  if (usersError) {
    return jsonError(500, `Failed to fetch user statuses: ${usersError.message}`);
  }

  const userMap = Object.fromEntries(
    (users ?? []).map((u: { user_id: string; status: string | null }) => [u.user_id, u.status])
  );

  const rsvpd = (apps ?? [])
    .filter((a: { user_id: string }) => userMap[a.user_id] === "rsvp_confirmed")
    .map((a: { user_id: string; [key: string]: unknown }) => ({ ...a, status: "rsvp_confirmed" }));

  return NextResponse.json(rsvpd, {
    headers: { "Cache-Control": "no-store" },
  });
}
