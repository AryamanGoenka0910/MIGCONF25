"use client";

import { useEffect, useState, useCallback, useMemo, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackgroundGlow from "@/components/background-glow";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { AdminApplication } from "@/lib/types";
import { cn, statusBadgeVariant, statusLabel } from "@/lib/admin-utils";

type AccessState = "loading" | "denied" | "granted";
type StatusFilter = "all" | "app_submitted" | "app_accepted" | "app_rejected" | "rsvp_confirmed" | "none";

const FILTER_LABELS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "app_submitted", label: "Submitted" },
  { value: "app_accepted", label: "Accepted" },
  { value: "app_rejected", label: "Rejected" },
  { value: "rsvp_confirmed", label: "RSVP Confirmed" },
  { value: "none", label: "No Status" },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, session } = useSession();

  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [resumeLoading, setResumeLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const hasFetched = useRef(false);

  const toggleRow = (appId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  // Check auth and role
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
      if (data.role === "Admin") {
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
      const res = await fetch("/api/admin_routes/applications", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to load applications.");
        return;
      }
      const data = (await res.json()) as AdminApplication[];
      setApplications(data);
    } catch {
      setError("Failed to load applications.");
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
    let list = applications;
    if (statusFilter !== "all") {
      list = list.filter((a) =>
        statusFilter === "none" ? a.status === null : a.status === statusFilter
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.user_name.toLowerCase().includes(q) ||
          a.user_email.toLowerCase().includes(q) ||
          a.school.toLowerCase().includes(q)
      );
    }
    return list;
  }, [applications, statusFilter, search]);

  const updateStatus = async (userId: string, appId: string, status: "app_accepted" | "app_rejected") => {
    if (!session) return;
    setActionLoading((prev) => ({ ...prev, [appId]: true }));
    try {
      const res = await fetch("/api/admin_routes/update-status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to update status.");
        return;
      }
      setApplications((prev) =>
        prev.map((a) => (a.user_id === userId ? { ...a, status } : a))
      );
    } catch {
      setError("Failed to update status.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [appId]: false }));
    }
  };


  const viewResume = async (app: AdminApplication) => {
    if (!session) return;
    const key = app.application_id;
    setResumeLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(
        `/api/admin_routes/resume?userId=${encodeURIComponent(app.user_id)}&appId=${encodeURIComponent(app.application_id)}`,
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

      <div className="relative z-10 max-w-[1600px] mx-auto mt-20">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Admin — Applications</h1>
          <Link
            href="/admin/team-management"
            className="text-sm text-white/50 hover:text-white/90 border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-colors"
          >
            Team Management →
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {/* Status filter buttons */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_LABELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  statusFilter === value
                    ? "bg-white/15 border-white/30 text-white"
                    : "bg-transparent border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search Name or School"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto w-64 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/25 focus:bg-white/8"
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
          <div className="text-white/50 text-sm py-12 text-center">Loading applications…</div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-white/50 text-sm py-12 text-center">
            {applications.length === 0 ? "No applications found." : "No applications match the current filters."}
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
                  <th className="px-4 py-3 text-left">Travel</th>
                  <th className="px-4 py-3 text-left">Trading Exp</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Resume</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <Fragment key={app.application_id}>
                  <tr
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleRow(app.application_id)}
                          className="text-white/40 hover:text-white/80 transition-colors"
                        >
                          <ChevronDown
                            size={14}
                            className={cn(
                              "transition-transform",
                              expandedRows.has(app.application_id) && "rotate-180"
                            )}
                          />
                        </button>
                        {app.user_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60">{app.user_email}</td>
                    <td className="px-4 py-3">{app.school}</td>
                    <td className="px-4 py-3">{app.major}</td>
                    <td className="px-4 py-3">{app.grad_year}</td>
                    <td className="px-4 py-3">
                      {app.travel_reimbursement ? (
                        <span className="text-emerald-400">Yes</span>
                      ) : (
                        <span className="text-white/40">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {app.trading_experience ? (
                        <span className="text-emerald-400">Yes</span>
                      ) : (
                        <span className="text-white/40">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40 whitespace-nowrap">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(app.status)}>
                        {statusLabel(app.status)}
                      </Badge>
                    </td>
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
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={
                            app.status === "app_accepted" || app.status === "rsvp_confirmed" || actionLoading[app.application_id]
                          }
                          onClick={() => updateStatus(app.user_id, app.application_id, "app_accepted")}
                          className="text-xs bg-emerald-600/80 hover:bg-emerald-600 text-white border-0 whitespace-nowrap"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={
                            app.status === "app_rejected" || app.status === "rsvp_confirmed" || actionLoading[app.application_id]
                          }
                          onClick={() => updateStatus(app.user_id, app.application_id, "app_rejected")}
                          className="text-xs whitespace-nowrap"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(app.application_id) && (
                    <tr className="border-b border-white/5 bg-white/2">
                      <td colSpan={12} className="px-4 pb-3 pt-1">
                        <div className="pl-5 flex flex-wrap gap-2">
                          {app.teammates.length === 0 ? (
                            <span className="text-white/30 text-xs">Solo — no teammates</span>
                          ) : (
                            app.teammates.map((tm) => (
                              <div
                                key={tm.user_id}
                                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs"
                              >
                                <span className="font-medium text-white">{tm.user_name}</span>
                                <span className="text-white/40">{tm.user_email}</span>
                                <Badge variant={statusBadgeVariant(tm.status)}>
                                  {tm.status ? statusLabel(tm.status) : "No App"}
                                </Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-white/30 text-right">
          {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
