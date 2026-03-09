"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackgroundGlow from "@/components/background-glow";
import type { AdminApplication } from "@/lib/types";

type AccessState = "loading" | "denied" | "granted";
type StatusFilter = "all" | "app_submitted" | "app_accepted" | "app_rejected" | "none";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const statusBadgeVariant = (
  status: AdminApplication["status"]
): "outline" | "default" | "destructive" | "secondary" => {
  if (status === "app_accepted") return "default";
  if (status === "app_rejected") return "destructive";
  if (status === "app_submitted") return "outline";
  return "secondary";
};

const statusLabel = (status: AdminApplication["status"]): string => {
  if (status === "app_submitted") return "Submitted";
  if (status === "app_accepted") return "Accepted";
  if (status === "app_rejected") return "Rejected";
  return "—";
};

const FILTER_LABELS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "app_submitted", label: "Submitted" },
  { value: "app_accepted", label: "Accepted" },
  { value: "app_rejected", label: "Rejected" },
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
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const [budgetLoading, setBudgetLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

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

      // Seed budget inputs with current values
      const inputs: Record<string, string> = {};
      for (const app of data) {
        inputs[app.application_id] = String(app.travel_budget ?? 0);
      }
      setBudgetInputs(inputs);
    } catch {
      setError("Failed to load applications.");
    } finally {
      setAppsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (accessState === "granted") {
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

  const saveBudget = async (userId: string, appId: string) => {
    if (!session) return;
    const raw = budgetInputs[appId] ?? "0";
    const value = parseFloat(raw);
    if (isNaN(value) || value < 0) {
      setError("Travel budget must be a non-negative number.");
      return;
    }
    setBudgetLoading((prev) => ({ ...prev, [appId]: true }));
    try {
      const res = await fetch("/api/admin_routes/travel-budget", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, travel_budget: value }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to update budget.");
        return;
      }
      setApplications((prev) =>
        prev.map((a) => (a.user_id === userId ? { ...a, travel_budget: value } : a))
      );
    } catch {
      setError("Failed to update budget.");
    } finally {
      setBudgetLoading((prev) => ({ ...prev, [appId]: false }));
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Admin — Applications</h1>
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
                  <th className="px-4 py-3 text-left">Travel Budget</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app, i) => (
                  <tr
                    key={app.application_id}
                    className={cn(
                      "border-b border-white/5 hover:bg-white/5 transition-colors",
                      i === filteredApplications.length - 1 && "border-b-0"
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{app.user_name}</td>
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
                    {/* Travel Budget */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={budgetInputs[app.application_id] ?? "0"}
                          onChange={(e) =>
                            setBudgetInputs((prev) => ({
                              ...prev,
                              [app.application_id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveBudget(app.user_id, app.application_id);
                          }}
                          className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-white/25"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={budgetLoading[app.application_id]}
                          onClick={() => saveBudget(app.user_id, app.application_id)}
                          className="text-xs border-white/20 text-white/70 hover:text-white hover:bg-white/10 px-2"
                        >
                          {budgetLoading[app.application_id] ? "…" : "Set"}
                        </Button>
                        <span className="text-white/50 text-xs whitespace-nowrap">
                          ${app.travel_budget}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={
                            app.status === "app_accepted" || actionLoading[app.application_id]
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
                            app.status === "app_rejected" || actionLoading[app.application_id]
                          }
                          onClick={() => updateStatus(app.user_id, app.application_id, "app_rejected")}
                          className="text-xs whitespace-nowrap"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
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
