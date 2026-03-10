"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import BackgroundGlow from "@/components/background-glow";

type AccessState = "loading" | "denied" | "granted";

type SponsorApplication = {
  application_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  school: string;
  major: string;
  grad_year: string;
  submitted_at: string | null;
  status: "rsvp_confirmed";
};

export default function SponsorPortalPage() {
  const router = useRouter();
  const { user, loading, session } = useSession();

  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [applications, setApplications] = useState<SponsorApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user || !session) {
      router.replace("/signin");
      return;
    }

    async function checkRole() {
      const res = await fetch("/api/user_routes/user", {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const data = await res.json();
      if (data.role === "Sponsor" || data.role === "Admin") {
        setAccessState("granted");
      } else {
        setAccessState("denied");
        router.replace("/dashboard");
      }
    }

    checkRole();
  }, [user, loading, session, router]);

  const fetchApplications = useCallback(async () => {
    if (!session) return;
    setAppsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sponsor_routes/applications", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to load attendees.");
        return;
      }
      const data = (await res.json()) as SponsorApplication[];
      setApplications(data);
    } catch {
      setError("Failed to load attendees.");
    } finally {
      setAppsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (accessState === "granted" && !hasFetched.current) {
      hasFetched.current = true;
      fetchApplications();
    }
  }, [accessState, fetchApplications]);

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter(
      (a) =>
        a.user_name.toLowerCase().includes(q) ||
        a.user_email.toLowerCase().includes(q) ||
        a.school.toLowerCase().includes(q)
    );
  }, [applications, search]);

  const viewResume = async (app: SponsorApplication) => {
    if (!session) return;
    const key = app.application_id;
    setResumeLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(
        `/api/sponsor_routes/resume?userId=${encodeURIComponent(app.user_id)}&appId=${encodeURIComponent(app.application_id)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Resume not found.");
        return;
      }
      const { url } = (await res.json()) as { url: string };
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Failed to load resume.");
    } finally {
      setResumeLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (accessState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundGlow />
        <p className="text-white/60 text-sm">Checking access…</p>
      </div>
    );
  }

  if (accessState === "denied") {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGlow />

      <div className="relative z-10 max-w-[1200px] mx-auto mt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Sponsor — Attendees</h1>
          <p className="mt-1 text-sm text-white/40">RSVP confirmed attendees</p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by name, email, or school…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/25 focus:bg-white/8"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-300">
            {error}
            <button
              className="ml-3 underline opacity-70 hover:opacity-100"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {appsLoading ? (
          <div className="text-white/50 text-sm py-12 text-center">Loading attendees…</div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-white/50 text-sm py-12 text-center">
            {applications.length === 0 ? "No confirmed attendees yet." : "No attendees match your search."}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto">
            <table className="w-full text-sm text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">School</th>
                  <th className="px-4 py-3 text-left">Major</th>
                  <th className="px-4 py-3 text-left">Grad Year</th>
                  <th className="px-4 py-3 text-left">Resume</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr
                    key={app.application_id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{app.user_name}</td>
                    <td className="px-4 py-3 text-white/60">{app.user_email}</td>
                    <td className="px-4 py-3">{app.school}</td>
                    <td className="px-4 py-3">{app.major}</td>
                    <td className="px-4 py-3">{app.grad_year}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={resumeLoading[app.application_id]}
                        onClick={() => viewResume(app)}
                        className="text-xs border-white/20 text-white/70 hover:text-white hover:bg-white/10 whitespace-nowrap"
                      >
                        {resumeLoading[app.application_id] ? "Loading…" : "View Resume"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-white/30 text-right">
          {filteredApplications.length} of {applications.length} attendee{applications.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
