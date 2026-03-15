import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireAuthUser } from "@/app/api/_utils";

export const runtime = "nodejs";

function sanitizePathSegment(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "screenshot";
}

export async function POST(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

  const { data: userRow, error: userError } = await supabaseAdmin
    .from("Users")
    .select("status")
    .eq("user_id", auth.user.id)
    .single();

  if (userError || !userRow) {
    return jsonError(404, "User not found.");
  }
  if (userRow.status !== "rsvp_confirmed") {
    return jsonError(403, "Only RSVP'd attendees can submit reimbursements.");
  }

  const { data: appRow } = await supabaseAdmin
    .from("Applications")
    .select("application_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  const appId = appRow?.application_id ?? "application";

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return jsonError(400, "No files provided.");
  }

  const files = formData.getAll("screenshots") as File[];
  if (files.length === 0) {
    return jsonError(400, "No files provided.");
  }

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    const filename = sanitizePathSegment(file.name || "screenshot");
    const screenshotPath = `${auth.user.id}/${appId}_${Date.now()}_${filename}`;
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from("Reimbursements")
      .upload(screenshotPath, Buffer.from(bytes), {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });
    if (uploadError) {
      return jsonError(500, `Failed to upload screenshot: ${uploadError.message}`);
    }
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
