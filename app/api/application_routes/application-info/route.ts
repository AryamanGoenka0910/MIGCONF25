import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseAdmin
    .from("Applications")
    .select("submitted_at")
    .eq("user_id", auth.user.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return jsonError(500, `Failed to load application status: ${error.message}`);
  }

  const submitted = !!(data && (data as { submitted_at?: string | null }).submitted_at);

  return NextResponse.json({ submitted }, { status: 200, headers: { "Cache-Control": "no-store" } });
}

