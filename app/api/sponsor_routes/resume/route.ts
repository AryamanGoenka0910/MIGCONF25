import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError, requireSponsor } from "@/app/api/_utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireSponsor(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const appId = searchParams.get("appId");

  if (!userId || !appId) {
    return jsonError(400, "Missing userId or appId query params.");
  }

  // Verify the user is rsvp_confirmed before serving the resume
  const { data: userData, error: userError } = await supabaseAdmin
    .from("Users")
    .select("status")
    .eq("user_id", userId)
    .single();

  if (userError || !userData || userData.status !== "rsvp_confirmed") {
    return jsonError(403, "Resume not available for this attendee.");
  }

  const { data: files, error: listError } = await supabaseAdmin.storage
    .from("Resumes")
    .list(userId);

  if (listError) {
    return jsonError(500, `Failed to list resumes: ${listError.message}`);
  }

  if (!files || files.length === 0) {
    return jsonError(404, "No resume found for this applicant.");
  }

  const resumeFile = files.find((f) => f.name.startsWith(`${appId}_`));
  if (!resumeFile) {
    return jsonError(404, "Resume not found for this application.");
  }

  const path = `${userId}/${resumeFile.name}`;
  const { data: signedData, error: signError } = await supabaseAdmin.storage
    .from("Resumes")
    .createSignedUrl(path, 3600);

  if (signError || !signedData?.signedUrl) {
    return jsonError(500, "Failed to generate signed URL.");
  }

  return NextResponse.json(
    { url: signedData.signedUrl },
    { headers: { "Cache-Control": "no-store" } }
  );
}
