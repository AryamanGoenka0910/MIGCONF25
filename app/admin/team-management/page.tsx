"use client";

import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackgroundGlow from "@/components/background-glow";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { cn, statusBadgeVariant, statusLabel } from "@/lib/admin-utils";
import Link from "next/link";

type AccessState = "loading" | "denied" | "granted";

type Member = {
  user_id: string;
  team_id: number | null;
  user_name: string;
  user_email: string;
  status: string | null;
  application: {
    school: string;
    major: string;
    grad_year: string;
    travel_reimbursement: boolean;
    trading_experience: boolean;
    submitted_at: string | null;
  } | null;
};

type Team = {
  team_id: number;
  members: Member[];
};

function UserRow({
  user,
  currentTeamId,
  allTeams,
  onMoved,
  session,
}: {
  user: Member;
  currentTeamId: number;
  allTeams: Team[];
  onMoved: () => void;
  session: { access_token: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const [moving, setMoving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const otherTeams = allTeams.filter((t) => t.team_id !== currentTeamId);

  useEffect(() => {
    if (!moving) return;
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setMoving(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moving]);

  const handleToggleMove = () => {
    if (moving) { setMoving(false); return; }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
    setMoving(true);
  };

  const handleRemove = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin_routes/remove-user-team", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.user_id, team_id: currentTeamId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to remove user.");
        return;
      }
      onMoved();
    } catch {
      setError("Failed to remove user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMove = async (targetTeamId: number | null) => {
    setMoving(false);
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin_routes/move-user-team", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.user_id, target_team_id: targetTeamId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to move user.");
        return;
      }
      onMoved();
    } catch {
      setError("Failed to move user.");
    } finally {
      setActionLoading(false);
    }
  };

  const app = user.application;

  return (
    <Fragment>
      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <ChevronDown size={14} className={cn("transition-transform", expanded && "rotate-180")} />
            </button>
            {user.user_name} {user.team_id !== null && <span className="text-xs text-white/30">({`Team #${user.team_id}`})</span>}
          </div>
        </td>
        <td className="px-4 py-3 text-white/60">{user.user_email}</td>
        <td className="px-4 py-3">
          <Badge variant={statusBadgeVariant(user.status as Parameters<typeof statusBadgeVariant>[0])}>
            {statusLabel(user.status as Parameters<typeof statusLabel>[0])}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div ref={btnRef} className="inline-block">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleMove}
                disabled={actionLoading}
                className="text-xs border-white/20 text-white/70 hover:text-white hover:bg-white/10 whitespace-nowrap"
              >
                Move
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRemove}
              disabled={actionLoading}
              className="text-xs border-red-500/30 text-red-400/70 hover:text-red-300 hover:bg-red-500/10 whitespace-nowrap"
            >
              Remove
            </Button>
          </div>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-white/5 bg-white/2">
          <td colSpan={4} className="px-4 pb-3 pt-1">
            <div className="pl-5">
              {app ? (
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/60">
                  <span><span className="text-white/30">School </span>{app.school}</span>
                  <span><span className="text-white/30">Major </span>{app.major}</span>
                  <span><span className="text-white/30">Grad Year </span>{app.grad_year}</span>
                  <span>
                    <span className="text-white/30">Travel </span>
                    {app.travel_reimbursement ? <span className="text-emerald-400">Yes</span> : <span className="text-white/40">No</span>}
                  </span>
                  <span>
                    <span className="text-white/30">Trading Exp </span>
                    {app.trading_experience ? <span className="text-emerald-400">Yes</span> : <span className="text-white/40">No</span>}
                  </span>
                  <span>
                    <span className="text-white/30">Submitted </span>
                    {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "—"}
                  </span>
                </div>
              ) : (
                <span className="text-white/30 text-xs">No application on file</span>
              )}
            </div>
          </td>
        </tr>
      )}

      {moving && dropdownPos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
            className="min-w-[180px] rounded-lg border border-white/15 bg-[#111] shadow-xl py-1"
          >
            {otherTeams.map((t) => (
              <button
                key={t.team_id}
                onClick={() => handleMove(t.team_id)}
                disabled={actionLoading}
                className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                Team #{t.team_id}
                <span className="ml-1 text-white/30">({t.members.length} member{t.members.length !== 1 ? "s" : ""})</span>
              </button>
            ))}
            <button
              onClick={() => handleMove(null)}
              disabled={actionLoading}
              className="w-full text-left px-3 py-2 text-xs text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors border-t border-white/10 mt-1"
            >
              New Solo Team
            </button>
          </div>,
          document.body
        )
      }
    </Fragment>
  );
}

export default function TeamManagementPage() {
  const router = useRouter();
  const { user, loading, session } = useSession();

  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [teams, setTeams] = useState<Team[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !session) { router.replace("/signin"); return; }
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

  const fetchTeams = useCallback(async () => {
    if (!session) return;
    setDataLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin_routes/teams", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to load teams.");
        return;
      }
      const data = (await res.json()) as Team[];
      setTeams(data);
    } catch {
      setError("Failed to load teams.");
    } finally {
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (accessState === "granted" && !hasFetched.current) {
      hasFetched.current = true;
      fetchTeams();
    }
  }, [accessState, fetchTeams]);

  // Find users whose user_id appears in more than one team's member list
  const idCount = new Map<string, { user_name: string; user_email: string; teams: number[] }>();
  for (const team of teams) {
    for (const m of team.members) {
      const existing = idCount.get(m.user_id);
      if (existing) {
        existing.teams.push(team.team_id);
      } else {
        idCount.set(m.user_id, { user_name: m.user_name, user_email: m.user_email, teams: [team.team_id] });
      }
    }
  }
  const duplicates = [...idCount.values()].filter((v) => v.teams.length > 1);

  const q = search.trim().toLowerCase();

  const rsvpTeams = teams.filter((t) =>
    t.members.some((m) => m.status === "rsvp_confirmed")
  );

  const visibleTeams = q
    ? rsvpTeams.filter((t) =>
        t.members.some(
          (m) => m.user_name.toLowerCase().includes(q) || m.user_email.toLowerCase().includes(q)
        )
      )
    : rsvpTeams;

  if (accessState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundGlow />
        <p className="text-white/60 text-sm">Checking access…</p>
      </div>
    );
  }

  if (accessState === "denied") return null;

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGlow />

      <div className="relative z-10 max-w-[1200px] mx-auto mt-20">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Applications
          </Link>
          <h1 className="text-3xl font-bold text-white">Admin — Team Management</h1>
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/25"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-300">
            {error}
            <button className="ml-3 underline opacity-70 hover:opacity-100" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        {duplicates.length > 0 && (
          <div className="mb-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
            <p className="text-xs font-semibold text-yellow-300 mb-2">⚠ Users appearing in multiple teams ({duplicates.length})</p>
            <div className="flex flex-col gap-1">
              {duplicates.map((d) => (
                <span key={d.user_email} className="text-xs text-yellow-200/80">
                  {d.user_name} <span className="text-yellow-200/40">{d.user_email}</span>
                  {" — "}Teams {d.teams.map((id) => `#${id}`).join(", ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {dataLoading ? (
          <div className="text-white/50 text-sm py-12 text-center">Loading teams…</div>
        ) : visibleTeams.length === 0 ? (
          <div className="text-white/50 text-sm py-12 text-center">
            {teams.length === 0 ? "No teams found." : "No results match the search."}
          </div>
        ) : (
          <>
            {visibleTeams.map((team) => (
              <div key={team.team_id} className="mb-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Team #{team.team_id}</span>
                  <span className="text-xs text-white/40">
                    {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <table className="w-full text-sm text-white/80">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wide">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.members.map((member) => (
                      <UserRow
                        key={member.user_id}
                        user={member}
                        currentTeamId={team.team_id}
                        allTeams={teams}
                        onMoved={fetchTeams}
                        session={session!}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <p className="mt-4 text-xs text-white/30 text-right">
              {visibleTeams.length} team{visibleTeams.length !== 1 ? "s" : ""} ·{" "}
              {visibleTeams.reduce((n, t) => n + t.members.length, 0)} member{visibleTeams.reduce((n, t) => n + t.members.length, 0) !== 1 ? "s" : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
