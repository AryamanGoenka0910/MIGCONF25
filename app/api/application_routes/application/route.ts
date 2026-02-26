import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserEmail, getUserDisplayName } from "@/lib/utils";
import type { Application } from "@/lib/types";
import { jsonError, requireAuthUser } from "@/app/api/_utils";

export const runtime = "nodejs";

type ApplicationInsert = {
  user_id: string;
  user_email: string;
  user_name: string;
  school: string;
  major: string;
  grad_year: string;
  how_did_you_hear: string;
  travel_reimbursement: boolean;
  trading_experience: boolean;
};

function asNullableUuidArray(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : null;
  }

  if (Array.isArray(value)) {
    const uuids = value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    return uuids.length ? uuids : null;
  }

  return null;
}

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
}

function parseBool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return null;
}

function sanitizePathSegment(name: string): string {
  // Keep it simple: alphanumerics, dot, dash, underscore. Replace the rest.
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "resume";
}

async function parseApplicationRequest(request: Request): Promise<
  | { ok: true; application: Application; resume: File }
  | { ok: false; status: number; error: string }
> {
  const contentType = request.headers.get("content-type") ?? "";

  // Preferred path: multipart form with a File.
  if (contentType.toLowerCase().includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return { ok: false, status: 400, error: "Invalid form data." };
    }

    const resume = form.get("resume");
    if (!(resume instanceof File)) {
      return { ok: false, status: 400, error: "Missing resume file." };
    }

    const school = nonEmptyString(form.get("school"));
    const major = nonEmptyString(form.get("major"));
    const gradYear = nonEmptyString(form.get("grad_year"));
    const how = nonEmptyString(form.get("how_did_you_hear"));
    const travel = parseBool(form.get("travel_reimbursement"));
    const trading = parseBool(form.get("trading_experience"));

    if (!school || !major || !gradYear || !how || travel === null || trading === null) {
      return { ok: false, status: 400, error: "Missing required application fields." };
    }

    const teammatesRaw = form.get("teammates");
    let teammates: string[] | null = null;
    if (typeof teammatesRaw === "string" && teammatesRaw.trim()) {
      try {
        const parsed = JSON.parse(teammatesRaw) as unknown;
        teammates = asNullableUuidArray(parsed);
      } catch {
        teammates = asNullableUuidArray(teammatesRaw);
      }
    } else {
      teammates = null;
    }

    return {
      ok: true,
      resume,
      application: {
        school,
        major,
        grad_year: gradYear,
        how_did_you_hear: how,
        teammates,
        travel_reimbursement: travel,
        trading_experience: trading,
      },
    };
  }

  return { ok: false, status: 400, error: "Resume file is required (submit as multipart/form-data)." };
}

export async function POST(request: Request) {
  const auth = await requireAuthUser(request);
  if (!auth.ok) return auth.response;

  const parsed = await parseApplicationRequest(request);
  if (!parsed.ok) {
    return jsonError(parsed.status, parsed.error);
  }

  const obj = parsed.application;
  const userEmail = getUserEmail(auth.user);
  const userName = getUserDisplayName(auth.user);

  const payload: ApplicationInsert = {
    user_id: auth.user.id,
    user_email: userEmail,
    user_name: userName,
    school: obj.school,
    major: obj.major,
    grad_year: obj.grad_year,
    how_did_you_hear: obj.how_did_you_hear,
    travel_reimbursement: obj.travel_reimbursement,
    trading_experience: obj.trading_experience,
  };

  const table = "Applications";

  const { data: applicationData, error: applicationError } = await supabaseAdmin
    .from(table)
    .insert(payload)
    .select("application_id")
    .single();

  if (applicationError) {     
    return jsonError(500, `Failed to submit application: ${applicationError.message}`);
  }

  if (!applicationData) {
    return jsonError(500, "Failed to submit application.");
  }

  // Upload resume to Supabase Storage (bucket: "Resumes")
  const appId = applicationData.application_id;
  const resume = parsed.resume;
  const filename = sanitizePathSegment(resume.name || "resume");
  const resumePath = `${auth.user.id}/${appId ?? "application"}_${Date.now()}_${filename}`;

  try {
    const arrayBuffer = await resume.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { error: uploadError } = await supabaseAdmin.storage
      .from("Resumes")
      .upload(resumePath, buffer, {
        contentType: resume.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      return jsonError(500, `Failed to upload resume: ${uploadError.message}`);
    }
  } catch {
    return jsonError(500, "Failed to upload resume.");
  }

  const { data: teamData, error: teamError } = await supabaseAdmin
    .from("Teams")
    .insert({ teammember_ids: [auth.user.id] })
    .select("team_id")
    .single();

  if (teamError) {
    return jsonError(500, `Failed to create team: ${teamError.message}`);
  }
  if (!teamData) {
    return jsonError(500, "Failed to create team.");
  }

  const createdTeamId = (teamData as { team_id?: unknown } | null)?.team_id ?? null;
  if (typeof createdTeamId !== "number" || !Number.isInteger(createdTeamId)) {
    return jsonError(500, "Failed to create team: missing team_id in inserted row.");
  }

  const { error: assignTeamError } = await supabaseAdmin
    .from("Users")
    .update({ team_id: createdTeamId })
    .eq("user_id", auth.user.id);

  if (assignTeamError) {
    // Best-effort rollback: don't leave an orphaned team row.
    await supabaseAdmin.from("Teams").delete().eq("team_id", createdTeamId);
    return jsonError(500, `Failed to assign team to user: ${assignTeamError.message}`);
  }  
  
  return NextResponse.json(
    { ok: true, id: applicationData.application_id, resume_path: resumePath, team_id: createdTeamId },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

