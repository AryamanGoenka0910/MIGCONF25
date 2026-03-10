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

  // Verify user is accepted before allowing RSVP
  const { data: userRow, error: userError } = await supabaseAdmin
    .from("Users")
    .select("status")
    .eq("user_id", auth.user.id)
    .single();

  if (userError || !userRow) {
    return jsonError(404, "User not found.");
  }
  if (userRow.status !== "app_accepted") {
    return jsonError(403, "Only accepted applicants can RSVP.");
  }

  // Fetch the user's application_id for use in storage paths
  const { data: appRow } = await supabaseAdmin
    .from("Applications")
    .select("application_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  const appId = appRow?.application_id ?? "application";

  // Upload any screenshot files if provided
  const formData = await request.formData().catch(() => null);
  if (formData) {
    const files = formData.getAll("screenshots") as File[];
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
  }

  // Mark user as RSVP'd
  const { error: updateError } = await supabaseAdmin
    .from("Users")
    .update({ status: "rsvp_confirmed" })
    .eq("user_id", auth.user.id);

  if (updateError) {
    return jsonError(500, `Failed to confirm RSVP: ${updateError.message}`);
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
