import { NextResponse } from "next/server";
import { jsonError, requireAuthUser } from "@/app/api/_utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { invite_id?: unknown } | null;
  if (!body || (typeof body.invite_id !== "string" && typeof body.invite_id !== "number")) {
    return jsonError(400, "Invalid request body.");
  }

  const { data, error } = await supabaseAdmin
    .from("Invites")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("invite_id", body.invite_id)
    .or(`to_user_id.eq.${auth.user.id},from_user_id.eq.${auth.user.id}`);

  if (error) {
    return jsonError(500, `Failed to cancel invite: ${error.message}`);
  }

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

