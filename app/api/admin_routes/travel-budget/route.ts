import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireAdmin } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const { user_id, travel_budget } = body as Record<string, unknown>;

  if (typeof user_id !== "string" || !user_id.trim()) {
    return jsonError(400, "Missing user_id.");
  }

  if (typeof travel_budget !== "number" || !Number.isFinite(travel_budget) || travel_budget < 0) {
    return jsonError(400, "travel_budget must be a non-negative number.");
  }

  const { error } = await supabaseAdmin
    .from("Users")
    .update({ travel_budget })
    .eq("user_id", user_id);

  if (error) {
    return jsonError(500, `Failed to update travel budget: ${error.message}`);
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
