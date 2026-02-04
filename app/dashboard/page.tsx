"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import {
  CalendarDays,
  Trophy,
  Mail,
  Linkedin,
  Instagram,
  Clock,
  ExternalLink,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserDisplayName } from "@/lib/utils";
import BackgroundGlow from "@/components/background-glow";
import { beginSignOut } from "@/lib/signout";

type ApplicationStatus = "not_started" | "submitted";

type UserResponse = {
  user: { user_id: string; user_email: string; user_name: string; team_id: number | null; role: string };
};

type TeamResponse = {
  team:
    | null
    | {
        team_id: number;
        members: {
          user_id: string;
          user_email: string;
          user_name: string;
          team_id: number | null;
          application_status: "confirmed" | "pending";
        }[];
      };
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const statusStyles: Record<ApplicationStatus, string> = {
  not_started: "border-destructive/25 bg-destructive/10 text-destructive-foreground",
  submitted: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
};

const statusLabels: Record<ApplicationStatus, string> = {
  not_started: "Not started",
  submitted: "Submitted",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, session } = useSession();

  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>("not_started");
  const [applicationStatusLoading, setApplicationStatusLoading] = useState(false);
  const [applicationStatusLoaded, setApplicationStatusLoaded] = useState(false);
  const [applicationButtonLoading, setApplicationButtonLoading] = useState(false);

  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [teamInfo, setTeamInfo] = useState<TeamResponse | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, router, user]);

  useEffect(() => {
    const token = session?.access_token;
    if (loading || !token || !user) return;

    // Cache user info for the duration of the browser session.
    // This avoids refetching /api/user on every Dashboard visit in the same session.
    const cacheKey = `migconf.user.v1:${user.id}`;
    try {
      const cachedRaw = sessionStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as UserResponse | null;
        if (cached?.user?.user_id === user.id) {
          setUserInfo(cached);
          setProfileError(null);
          setProfileLoading(false);
          setProfileLoaded(true);
          return;
        }
      }
    } catch {
      // Ignore cache read/parse errors and fall back to network.
    }

    const controller = new AbortController();

    const run = async () => {
      setProfileLoading(true);
      setProfileError(null);
      setProfileLoaded(false);

      try {
        const userRes = await fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const userJson = (await userRes.json()) as Partial<UserResponse> & { error?: string };

        if (!userRes.ok) {
          setUserInfo(null);
          setProfileError(userJson.error ?? "Failed to load profile.");
          return;
        }

        setUserInfo(userJson as UserResponse);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(userJson as UserResponse));
        } catch {
          // Ignore cache write errors (quota, privacy mode, etc).
        }

      } catch {
        if (controller.signal.aborted) return;
        setUserInfo(null);
        setProfileError("Failed to load profile.");
      } finally {
        if (!controller.signal.aborted) {
          setProfileLoading(false);
          setProfileLoaded(true);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [loading, session?.access_token, user]);

  useEffect(() => {
    const token = session?.access_token;
    if (loading || !token || !user) return;

    const cacheKey = `migconf.application-submitted.v1:${user.id}`;
    const cachedSubmitted = (() => {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { submitted?: unknown } | boolean;
        if (typeof parsed === "boolean") return parsed;
        return typeof parsed?.submitted === "boolean" ? parsed.submitted : null;
      } catch {
        return null;
      }
    })();

    // Set initial UI from cache.
    if (cachedSubmitted !== null) {
      setApplicationStatus(cachedSubmitted ? "submitted" : "not_started");
      setApplicationStatusLoaded(true);
      setApplicationStatusLoading(false);
    } else {
      setApplicationStatusLoaded(false);
      setApplicationStatusLoading(true);
    }

    // If we already know it's submitted in this session, it won't revert — skip the request.
    if (cachedSubmitted === true) return;

    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch("/api/application-info", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const json = (await res.json()) as { submitted?: boolean; error?: string };

        const submitted = !!json.submitted;
        if (!res.ok) throw new Error(json.error ?? "Failed to load application status.");

        setApplicationStatus(submitted ? "submitted" : "not_started");
        setApplicationStatusLoaded(true);

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ submitted }));
        } catch {
          // Ignore cache write errors.
        }
      } catch {
        if (controller.signal.aborted) return;
        // If we had no cached value, just stop showing the spinner and fall back to default UI.
        if (cachedSubmitted === null) setApplicationStatusLoaded(true);
      } finally {
        if (!controller.signal.aborted) setApplicationStatusLoading(false);
      }
    };

    const t = setTimeout(() => void run(), 0);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [loading, session?.access_token, user]);

  useEffect(() => {
    const token = session?.access_token;
    const teamId = userInfo?.user?.team_id ?? null;
    if (loading || !token || !user) return;
    if (!profileLoaded) return;

    // Team is non-blocking; only fetch if we know the user has a team.
    if (teamId === null) {
      setTeamInfo({ team: null });
      setTeamError(null);
      setTeamLoading(false);
      return;
    }

    // Cache team info for the duration of the browser session (only for users with a team).
    // This avoids refetching /api/team on every Dashboard visit in the same session.
    const cacheKey = `migconf.team.v1:${user.id}`;
    try {
      const cachedRaw = sessionStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as { team: TeamResponse["team"] } | null;
        if (cached?.team && cached.team.team_id === teamId) {
          setTeamInfo({ team: cached.team });
          setTeamError(null);
          setTeamLoading(false);
          return;
        }
      }
    } catch {
      // Ignore cache read/parse errors and fall back to network.
    }

    const controller = new AbortController();
    const run = async () => {
      setTeamLoading(true);
      setTeamError(null);

      try {
        const teamRes = await fetch("/api/team", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const teamJson = (await teamRes.json()) as Partial<TeamResponse> & { error?: string };

        if (!teamRes.ok) {
          setTeamInfo({ team: null });
          setTeamError(teamJson.error ?? "Failed to load team.");
          return;
        }

        setTeamInfo(teamJson as TeamResponse);
        try {
          if ((teamJson as TeamResponse)?.team) {
            sessionStorage.setItem(cacheKey, JSON.stringify({ team: (teamJson as TeamResponse).team }));
          }
        } catch {
          // Ignore cache write errors (quota, privacy mode, etc).
        }
      } catch {
        if (controller.signal.aborted) return;
        setTeamInfo({ team: null });
        setTeamError("Failed to load team.");
      } finally {
        if (!controller.signal.aborted) setTeamLoading(false);
      }
    };

    // Yield to the browser so the page can paint before team fetching begins.
    const t = setTimeout(() => void run(), 0);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [loading, profileLoaded, session?.access_token, user, userInfo?.user?.team_id]);

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <BackgroundGlow />
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div className="rounded-2xl border border-border bg-card/40 px-6 py-4 text-sm text-muted-foreground backdrop-blur">
            Checking your session…
          </div>
        </div>
      </main>
    );
  }

  const displayNameFromAuth = getUserDisplayName(user);
  const displayName = userInfo?.user?.user_name ?? displayNameFromAuth;
  const teamMembers = teamInfo?.team?.members ?? [];
  const userRole = userInfo?.user?.role ?? "Attendee";

  const showApplicationLoading = applicationStatusLoading && !applicationStatusLoaded;
  const isApplicationSubmitted = applicationStatus === "submitted";

  const quickStats = [
    { label: "Role", value: userRole },
    { label: "Application", value: showApplicationLoading ? "…" : statusLabels[applicationStatus] },
    { label: "Team members", value: !profileLoaded || teamLoading ? "…" : `${teamMembers.length}` },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6">
        {/* Top header card */}
        <section className="mt-16 rounded-3xl border border-border bg-card/40 p-8 backdrop-blur animate-fade-in-up opacity-0">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/30 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Dashboard
              </div>

              <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                {displayName}{" "}
                <span className="text-muted-foreground">({userRole})</span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Here is your staging area for everything MIG Quant Conference-related.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                    showApplicationLoading
                      ? "border-border bg-background/30 text-muted-foreground"
                      : statusStyles[applicationStatus]
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  {showApplicationLoading ? "Checking application…" : statusLabels[applicationStatus]}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={showApplicationLoading || isApplicationSubmitted || applicationButtonLoading}
                onClick={() => {
                  if (showApplicationLoading || isApplicationSubmitted) return;
                  setApplicationButtonLoading(true);
                  router.push("/application");
                }}
              >
                {showApplicationLoading
                  ? "Checking…"
                  : isApplicationSubmitted
                    ? "Application Submitted"
                    : applicationButtonLoading
                      ? "Opening…"
                      : "Start Application"}
                {showApplicationLoading || isApplicationSubmitted ? null : <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-border bg-background/30 hover:bg-background/45"
                onClick={() => router.push("/")}
              >
                View Schedule
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="bg-card/50 hover:bg-card/70"
                onClick={() => beginSignOut(router, { returnTo: "/signin" })}
              >
                Sign out <LogOut className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {quickStats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-background/25 p-5">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="mt-1 text-xl font-semibold tracking-tight">{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Profile + Team */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Profile */}
          <GlassCard
            title="Profile"
            subtitle={
              profileLoading ? "Loading profile…" : profileError ? profileError : undefined
            }
          >
            <div className="space-y-3 text-sm">
              <Row k="Name" v={displayName} />
              <Row k="Email" v={userInfo?.user?.user_email ?? user?.email ?? "Unavailable"} />
              <Row k="Conference role" v={userRole} />
              {/* Member since removed */}
            </div>

            {/* <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-border bg-background/30 hover:bg-background/45"
                onClick={() => router.push("/signup")}
              >
                Update profile
              </Button>
            </div> */}
          </GlassCard>

          {/* Team */}
          <GlassCard
            title="Team"
            subtitle={
              !profileLoaded ? "Loading team…" : teamLoading ? "Loading team…" : teamError ? teamError : undefined
            }
          >
            {!profileLoaded || teamLoading ? (
              <div className="rounded-2xl border border-border bg-background/25 p-4 text-sm text-muted-foreground">
                Loading team…
              </div>
            ) : teamError ? (
              <div className="rounded-2xl border border-border bg-background/25 p-4 text-sm text-muted-foreground">
                {teamError}
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background/20 p-6 text-sm text-muted-foreground">
                No team yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {teamMembers.map((m) => (
                  <div
                    key={m.user_id}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-background/25 p-4 transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {/* shine sweep */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-transparent via-foreground/10 to-transparent blur-md" />
                    </div>

                    <div className="relative flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{m.user_name}</div>
                        <div className="truncate text-xs text-muted-foreground">{m.user_email}</div>
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                          m.application_status === "confirmed"
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-100"
                        )}
                      >
                        {m.application_status === "confirmed" ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </section>

        {/* Important Dates + Contact & Support */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Important Dates */}
          <GlassCard title="Important Dates" subtitle={undefined}>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border bg-background/25 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/40">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Application Deadline</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      March 1st, 2026 at 11:59 PM ET
                    </div>

                    {/* <div className="mt-2 text-xs text-destructive">Deadline has passed</div> */}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/25 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/40">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Competition Event</div>
                    <div className="mt-1 text-sm text-muted-foreground">March 15, 2026</div>
                    <a
                      href="https://maps.google.com/?q=Ann%20Arbor%2C%20MI"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary underline underline-offset-4"
                    >
                      Ann Arbor, MI <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Contact & Support */}
          <GlassCard title="Contact & Support" subtitle={undefined}>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-background/25 p-4">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-semibold">Questions?</div>
                  <a
                    href="mailto:mig.board@umich.edu"
                    className="text-sm text-muted-foreground underline underline-offset-4"
                  >
                    mig.board@umich.edu
                  </a>
                </div>
              </div>

              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-border bg-background/25 p-4 transition hover:bg-background/35"
              >
                <Linkedin className="h-5 w-5 text-primary" />
                <div className="text-sm font-semibold">LinkedIn</div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </a>

              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-border bg-background/25 p-4 transition hover:bg-background/35"
              >
                <Instagram className="h-5 w-5 text-primary" />
                <div className="text-sm font-semibold">Instagram</div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </a>

              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/25 p-4 text-sm text-muted-foreground">
                <Clock className="h-5 w-5 text-primary" />
                We aim to respond within 48 hours.
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}

function GlassCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur animate-fade-in-up opacity-0">
      {/* shine sweep */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-transparent via-foreground/10 to-transparent blur-md" />
      </div>

      {/* soft blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl opacity-70" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{title}</div>
            {subtitle ? <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div> : null}
          </div>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-border bg-background/20 px-4 py-3">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="text-sm font-semibold">{v}</div>
    </div>
  );
}