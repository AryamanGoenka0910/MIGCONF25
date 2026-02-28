"use client";

//TODO FIX TYPES
//Check Team Capacity (max 4 people)

import { useEffect, useMemo, useState } from "react";
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
  InfoIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserDisplayName } from "@/lib/utils";
import BackgroundGlow from "@/components/background-glow";
import { beginSignOut } from "@/lib/signout";
import { Combobox } from "@headlessui/react";
import { AvailableUser } from "@/lib/types";
import { fetchAllUsers } from "@/lib/fetch-all-users";
import type { InviteUserRow, Invite, User } from "@/lib/types";

import MessageOverlay from "@/components/MessageOverlay";


type ApplicationStatus = "not_started" | "submitted";

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
          status: "confirmed" | "pending_application" | "pending_invite";
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
  not_started: "Not Started",
  submitted: "Submitted",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, session } = useSession();

  const [reloadKeyForInvites, setReloadKeyForInvites] = useState<number>(0);
  const [reloadKeyForTeam, setReloadKeyForTeam] = useState<number>(0);

  // User Application Info
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>("not_started");
  const [applicationStatusLoading, setApplicationStatusLoading] = useState(false);
  const [applicationButtonLoading, setApplicationButtonLoading] = useState(false);

  // Profile Info
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Team Info
  const [teamInfo, setTeamInfo] = useState<TeamResponse | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);

  // Invites Info
  const [sentInvites, setSentInvites] = useState<Invite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<Invite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  const [inviteError, setInviteError] = useState<string | null>(null);
  const [sendingInviteLoading, setSendingInviteLoading] = useState(false);
  const [acceptingInviteLoading, setAcceptingInviteLoading] = useState<Record<string, boolean>>({});

  // Section Toggles
  const [teammateInfoOpen, setTeammateInfoOpen] = useState(false);
  const [teamAddSection, setTeamAddSection] = useState(false);

  /////ADDING TEAM MEMBERS\\\\\\

  // Selecting Teammates
  const [teammateQuery, setTeammateQuery] = useState("");  
  const [selectedTeammateUser, setSelectedTeammateUser] = useState<AvailableUser | null>(null);

  // Available Users
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [availableUsersLoading, setAvailableUsersLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setAvailableUsersLoading(false);
      return;
    }

    const controller = new AbortController();
    void fetchAllUsers({
      token: session?.access_token,
      currentUserId: user.id,
      setUsers: setAvailableUsers,
      setLoading: setAvailableUsersLoading,
      signal: controller.signal,
      includeTeamed: "true",
    });

    return () => controller.abort();
  }, [loading, session?.access_token, user]);

  const filteredUsers = useMemo(() => {
    // Get IDs of users to exclude
    const currentUserId = user?.id;
    const teammateIds = new Set(teamInfo?.team?.members.map((m) => m.user_id));
    const sentInviteUserIds = new Set(sentInvites.map((i) => i.to_user_id));
    const receivedInviteUserIds = new Set(receivedInvites.map((i) => i.from_user_id));

    // Filter out current user, team members, and invited users
    const excludedUsers = availableUsers.filter((u) => {
      if (u.id === currentUserId) return false;
      if (teammateIds.has(u.id)) return false;
      if (sentInviteUserIds.has(u.id)) return false;
      if (receivedInviteUserIds.has(u.id)) return false;
      return true;
    });

    // Apply search query
    const q = teammateQuery.trim().toLowerCase();
    if (!q) return excludedUsers;

    return excludedUsers.filter((u) => {
      const name = (u.full_name ?? "").toLowerCase();
      const email = u.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [availableUsers, teammateQuery, user?.id, teamInfo, sentInvites, receivedInvites]);

  const inviteTeammate = async () => {
    const token = session?.access_token;
    if (!token || !selectedTeammateUser?.id || !teamInfo?.team?.team_id) {
      setSendingInviteLoading(false);
      setInviteError(null);
      return;
    };
    
    setSendingInviteLoading(true);
    console.log("Inviting teammate", selectedTeammateUser.id, teamInfo.team.team_id);
    const res = await fetch("/api/invite_routes/send_team_invite", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to_user_id: selectedTeammateUser.id, team_id: teamInfo.team.team_id }),
    });

    if (!res.ok) {
      const json = await res.json();
      console.error(json);

      if (res.status === 400) {
        setInviteError(json.error);
      }

      setSendingInviteLoading(false);
      return;
    }

    setInviteError(null);
    setSendingInviteLoading(false);
  };

  const rejectInvite = async (inviteId: string) => {
    const token = session?.access_token;
    if (!token) return;
    if (!inviteId) return;

    console.log("Rejecting invite", inviteId);
    const res = await fetch("/api/invite_routes/reject_invite", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invite_id: inviteId }),
    });

    if (!res.ok) {
      console.error(await res.json());
      return;
    }
  };

  const cancelInvite = async (inviteId: string) => {
    const token = session?.access_token;
    if (!token) return;
    if (!inviteId) return;

    console.log("Cancelling invite", inviteId);
    const res = await fetch("/api/invite_routes/cancel_invite", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invite_id: inviteId }),
    });

    if (!res.ok) {
      console.error(await res.json());
      return;
    }
  };

  const acceptInvite = async (inviteId: string) => {
    const token = session?.access_token;
    if (!token || !inviteId) {
      setAcceptingInviteLoading((prev) => ({ ...prev, [inviteId]: false }));
      return
    };

    setAcceptingInviteLoading((prev) => ({ ...prev, [inviteId]: true }));
    console.log("Accepting invite", inviteId);

    const res = await fetch("/api/invite_routes/accept_invite", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invite_id: inviteId }),
    });

    if (!res.ok) {
      const json = await res.json();
      console.error(json);

      if (res.status === 400) {
        setInviteError(json.error);
      }
      setAcceptingInviteLoading((prev) => ({ ...prev, [inviteId]: false }));
      return;
    }

    setAcceptingInviteLoading((prev) => ({ ...prev, [inviteId]: false }));
  };

  const leaveTeam = async () => {
    const token = session?.access_token;
    if (!token || !teamInfo?.team?.team_id) return;

    console.log("Leaving team", teamInfo.team.team_id);
    const res = await fetch("/api/team_routes/leave_team", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ team_id: teamInfo.team.team_id }),
    });

    if (!res.ok) {
      console.error(await res.json());
      return;
    }
  };
  /////\\\\\\

  // Redirect unauthenticated users to the sign-in page once session loading finishes.
  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, router, user]);

  // Load and cache profile info for the current user.
  useEffect(() => {
    const token = session?.access_token;
    if (loading || !token || !user) {
      setUserInfo(null);
      setProfileLoading(false);
      return;
    }

    // Cache user info for the duration of the browser session.
    // This avoids refetching /api/user on every Dashboard visit in the same session.
    const cacheKey = `migconf.user.v1:${user.id}`;
    try {
      const cachedRaw = sessionStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as User | null;
        if (cached?.user_id === user.id) {
          setUserInfo(cached);
          setProfileLoading(false);
          return;
        }
      }
    } catch {
      // Ignore cache read/parse errors and fall back to network.
    }

    const controller = new AbortController();
    const run = async () => {
      setProfileLoading(true);

      try {
        const userRes = await fetch("/api/user_routes/user", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        
        const userJson = (await userRes.json()) as Partial<User> & { error?: string };

        if (!userRes.ok) {
          setUserInfo(null);
          setProfileLoading(false);
          return;
        }

        setUserInfo(userJson as User);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(userJson as User));
        } catch {
          // Ignore cache write errors (quota, privacy mode, etc).
        }

      } catch {
        if (controller.signal.aborted) return;
        setUserInfo(null);
      } finally {
        if (!controller.signal.aborted) {
          setProfileLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [loading, session?.access_token, user]);

  // Resolve and cache application submission status to drive dashboard CTA state.
  useEffect(() => {
    const token = session?.access_token;
    if (loading || !token || !user) {
      setApplicationStatus("not_started");
      setApplicationStatusLoading(false);
      return;
    };

    const cacheKey = `migconf.application-submitted.v1:${user.id}`;
    const cachedSubmitted = (() => {
      try {
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw){
          const cached = JSON.parse(cachedRaw) as { submitted?: unknown } | boolean;
          if (typeof cached === "boolean") return cached;
          return typeof cached?.submitted === "boolean" ? cached.submitted : null;
        } 
        return null;
      } catch {
        return null;
      }
    })();

    // Set initial UI from cache.
    if (cachedSubmitted !== null) {
      setApplicationStatus(cachedSubmitted ? "submitted" : "not_started");
      setApplicationStatusLoading(false);
    } else {
      setApplicationStatusLoading(true);
    }

    // If we already know it's submitted in this session, it won't revert — skip the request.
    if (cachedSubmitted === true) return;

    const controller = new AbortController();
    const run = async () => {
      try {
        const appRes = await fetch("/api/application_routes/application-info", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        
        const appJson = (await appRes.json()) as { submitted?: boolean; error?: string };
        const submitted = !!appJson.submitted;
        
        if (!appRes.ok) {
          setApplicationStatus("not_started");
          setApplicationStatusLoading(false);
          return;
        }

        setApplicationStatus(submitted ? "submitted" : "not_started");

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ submitted }));
        } catch {
          // Ignore cache write errors.
        }

      } catch {
        if (controller.signal.aborted) return;
      } finally {
        if (!controller.signal.aborted) {
          setApplicationStatusLoading(false);
        }
      }
    };

    const t = setTimeout(() => void run(), 0);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [loading, session?.access_token, user]);

  // Load and cache team details after profile data confirms a team association.
  useEffect(() => {
    const token = session?.access_token;
    const teamId = userInfo?.team_id ?? null;
    if (loading || !token || !user || profileLoading) {
      setTeamInfo({ team: null });
      setTeamError(null);
      setTeamLoading(false);
      return;
    }

    // Team is non-blocking; only fetch if we know the user has a team.
    if (teamId === null) {
      setTeamInfo({ team: null });
      setTeamError(null);
      setTeamLoading(false);
      return;
    }

    // // Cache team info for the duration of the browser session (only for users with a team).
    // // This avoids refetching /api/team on every Dashboard visit in the same session.
    // const cacheKey = `migconf.team.v1:${user.id}`;
    // try {
    //   const cachedRaw = sessionStorage.getItem(cacheKey);
    //   if (cachedRaw) {
    //     const cached = JSON.parse(cachedRaw) as { team: TeamResponse["team"] } | null;
    //     if (cached?.team && cached.team.team_id === teamId) {
    //       setTeamInfo({ team: cached.team });
    //       setTeamError(null);
    //       setTeamLoading(false);
    //       return;
    //     }
    //   }
    // } catch {
    //   // Ignore cache read/parse errors and fall back to network.
    // }

    const controller = new AbortController();
    const run = async () => {
      setTeamError(null);
      setTeamLoading(true);


      try {
        const teamRes = await fetch("/api/team_routes/team", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const teamJson = (await teamRes.json()) as Partial<TeamResponse> & { error?: string };

        if (!teamRes.ok) {
          setTeamInfo({ team: null });
          setTeamError(teamJson.error ?? "Failed to load team Refresh");
          setTeamLoading(false);
          return;
        }

        setTeamInfo(teamJson as TeamResponse);
        // try {
        //   if ((teamJson as TeamResponse)?.team) {
        //     sessionStorage.setItem(cacheKey, JSON.stringify({ team: (teamJson as TeamResponse).team }));
        //   }
        // } catch {
        //   // Ignore cache write errors (quota, privacy mode, etc).
        // }
      } catch {
        if (controller.signal.aborted) return;
        setTeamInfo({ team: null });
        setTeamError("Failed to load team Refresh.");
      } finally {
        if (!controller.signal.aborted) {
          setTeamLoading(false);
        }
      }
    };

    // Yield to the browser so the page can paint before team fetching begins.
    const t = setTimeout(() => void run(), 0);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [loading, profileLoading, session?.access_token, user, userInfo?.team_id, reloadKeyForTeam]);


  useEffect(() => {
    const token = session?.access_token;
    if (loading || !token || !user) {
      setSentInvites([]);
      setReceivedInvites([]);
      setInvitesLoading(false);
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      setInvitesLoading(true);
      try {
        const res = await fetch("/api/invite_routes/get_invites", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const json = (await res.json()) as Partial<{
          sent_invites: Invite[];
          received_invites: Invite[];
          error?: string;
        }>;

        if (!res.ok) {
          console.error("Failed to load invites", json.error ?? json);
          setSentInvites([]);
          setReceivedInvites([]);
          setInvitesLoading(false);
          return;
        }

        const nextSent = Array.isArray(json.sent_invites) ? json.sent_invites : [];
        const nextReceived = Array.isArray(json.received_invites) ? json.received_invites : [];

        setSentInvites(nextSent);
        setReceivedInvites(nextReceived);

        console.log("Invites set", { sent: nextSent.length, received: nextReceived.length });
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error("Failed to load invites", e);
        setSentInvites([]);
        setReceivedInvites([]);
        setInvitesLoading(false);
      } finally {
        if (!controller.signal.aborted) {
          setInvitesLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [loading, session?.access_token, user, reloadKeyForInvites]);


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
  const displayName = userInfo?.user_name ?? displayNameFromAuth;
  const teamMembers = teamInfo?.team?.members ?? [];
  const userRole = userInfo?.role ?? "Attendee";

  const isApplicationSubmitted = applicationStatus === "submitted";

  const quickStats = [
    { label: "Role", value: userRole },
    { label: "Email", value: userInfo?.user_email ?? user?.email ?? "Unavailable" },
    { label: "Team members", value: profileLoading || teamLoading ? "…" : `${teamMembers.length}` },
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
                {displayName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Here is your staging area for everything MIG Quant Conference-related.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                    applicationStatusLoading
                      ? "border-border bg-background/30 text-muted-foreground"
                      : statusStyles[applicationStatus]
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  {applicationStatusLoading ? "Checking application…" : statusLabels[applicationStatus]}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                variant="default"
                disabled={applicationStatusLoading || isApplicationSubmitted || applicationButtonLoading}
                onClick={() => {
                  if (applicationStatusLoading || isApplicationSubmitted) return;
                  setApplicationButtonLoading(true);
                  router.push("/application");
                }}
              >
                {applicationStatusLoading
                  ? "Checking…"
                  : isApplicationSubmitted
                    ? "Application Submitted"
                    : applicationButtonLoading
                      ? "Opening…"
                      : "Start Application"}
                {applicationStatusLoading || isApplicationSubmitted ? null : <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/")}
              >
                View Schedule
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => beginSignOut(router, { returnTo: "/" })}
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
                <div className={`mt-1 font-semibold tracking-tight text-xl ${s.label === "Email" ? "wrap-break-word" : ""}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 animate-fade-in-up">
          <div className="flex flex-row items-center justify-between gap-2">
            <p>PLEASE READ: click the info button for team formation guidelines.</p>
            <Button variant="outline" onClick={() => setTeammateInfoOpen?.(true)}>
              <InfoIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
          
        {/* Invites + Team */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Invites */}
          <GlassCard 
            title="Team Invites"
            applicationStatus={applicationStatus}
            teamAdd={true}
            setTeamAddSection={setTeamAddSection}
          >
              {invitesLoading ? (
                <div className="rounded-2xl border border-border bg-background/25 p-4 text-sm text-muted-foreground">
                  Loading invites…
                </div>
              ) : (
              <div className="mt-5 space-y-4">
              {/* Incoming */}
                <div className="rounded-2xl border border-border bg-background/25 p-4">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="text-sm font-semibold">Incoming invites</div>
                    <div className="text-xs text-muted-foreground">Invites sent to you</div>
                  </div>

                  {receivedInvites.length === 0 ? (
                    <div className="mt-3 rounded-xl border border-dashed border-border bg-background/20 p-4 text-sm text-muted-foreground">
                      No incoming invites.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {receivedInvites.map((i) => (
                        <TeamRow key={String(i.invite_id)} id={i.from_user_id}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">
                                {i.from_user?.user_name ?? ""}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {i.from_user?.user_email ?? ""}
                              </div>
                            </div>
                              {acceptingInviteLoading[i.invite_id] ? (
                                <Button size="sm" variant="default" disabled>
                                  Accepting…
                                </Button>
                              ) : (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="default" onClick={async () => {
                                    await acceptInvite(i.invite_id);
                                    setReloadKeyForTeam(reloadKeyForTeam + 1);
                                    setReloadKeyForInvites(reloadKeyForInvites + 1);
                                  }}>
                                    Accept
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={async () => {
                                    await rejectInvite(i.invite_id);
                                    setReloadKeyForInvites(reloadKeyForInvites + 1);
                                  }}>
                                    Reject
                                  </Button>
                                </div>
                             )}
                          </div>
                        </TeamRow>
                      ))}
                    </div>
                  )}
                </div>

              {/* Outgoing */}
              <div className="rounded-2xl border border-border bg-background/25 p-4">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="text-sm font-semibold">Outgoing invites</div>
                  <div className="text-xs text-muted-foreground">Invites you sent</div>
                </div>

                {sentInvites.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-dashed border-border bg-background/20 p-4 text-sm text-muted-foreground">
                    No outgoing invites.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {sentInvites.map((i) => (
                      <TeamRow key={String(i.invite_id)} id={i.to_user_id}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              {i.to_user?.user_name ?? i.to_user_id}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {i.to_user?.user_email ?? ""}
                            </div>
                          </div>

                          <Button size="sm" variant="outline" onClick={async () => {
                            await cancelInvite(i.invite_id);
                            setReloadKeyForInvites(reloadKeyForInvites + 1);
                          }}>
                              Cancel
                          </Button>
                        </div>
                      </TeamRow>
                    ))}
                  </div>
                )}      
              </div>
            </div>
            )}
          </GlassCard>

          {/* Team */}
          <GlassCard
            title="Team"
            teamAdd={true}
            applicationStatus={applicationStatus}
            setTeamAddSection={setTeamAddSection}
          >
            {profileLoading || teamLoading ? (
              <div className="rounded-2xl border border-border bg-background/25 p-4 text-sm text-muted-foreground">
                Loading team…
              </div>
            ) : teamError ? (
              <div className="rounded-2xl border border-border bg-background/25 p-4 text-sm text-muted-foreground">
                {teamError}
              </div>
            ) : teamMembers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background/20 p-6 text-sm text-muted-foreground">
                  No team yet. Please click the info button for team formation guidelines. And Submit your application for to create a team.
                </div>
            ) : (
              <div className="grid gap-3">
                {teamMembers.map((m) => (
                  <TeamRow key={m.user_id} id={m.user_id}>
                   
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{m.user_name}{m.user_id === user?.id ? " (You)" : ""}</div>
                        <div className="truncate text-xs text-muted-foreground">{m.user_email}</div>
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                          m.status === "confirmed"
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-100"
                        )}
                      >
                        {m.status === "confirmed" ? "Confirmed" : "Pending Application"}
                      </span>
                    </div>
                  </TeamRow>
                ))}

                {teamMembers.length > 1 && (
                <Button size="sm" variant="outline" onClick={async () => {
                  await leaveTeam();
                  setReloadKeyForTeam(reloadKeyForTeam + 1);
                }}>
                  Leave Team
                  </Button>
                )}
              </div>
            )}
          </GlassCard>
        </section>

        {/* Important Dates + Contact & Support */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Important Dates */}
          <GlassCard title="Important Dates">
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border bg-background/25 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/40">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Application Deadline</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      March 5th, 2026 at 11:59 PM ET
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
                    <div className="mt-1 text-sm text-muted-foreground">March 20th, 2026</div>
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
          <GlassCard title="Contact & Support">
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-background/25 p-4">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-semibold">Questions?</div>
                  <a
                    href="mailto:mig.quant.board@umich.edu"
                    className="text-sm text-muted-foreground underline underline-offset-4"
                  >
                    mig.quant.board@umich.edu
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

        {teammateInfoOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setTeammateInfoOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Teammates</p>
                  <div className="space-y-2 text-sm text-white/90">
                    <h4 className="pt-1 text-sm font-semibold text-white">
                      Team Formation for the MIG Quant Conference
                    </h4>
                    <p>
                      The MIG Quant Conference is a team-based event. Teams may consist of up to 4 members total
                      (you + up to 3 teammates).
                    </p>
                    <p className="font-semibold text-white">Steps to form a team:</p>
                    <div className="space-y-3">
                        <p className=" text-white">
                          Step 1: Everyone Applies Individually First
                        </p>
                        <p className=" text-white">
                          Step 2: One Person Invites Teammates to their Team Using the Add Teammates Button in the Team Section
                        </p>
                        <p className=" text-white">
                          Step 3: The Teammate Accepts the Invite In the Invites Section
                        </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-white/60 hover:text-white"
                  onClick={() => setTeammateInfoOpen(false)}
                  aria-label="Close teammate info"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {teamAddSection && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setTeamAddSection(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Add teammate"
          >
            <div
              className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Team</p>
                  <h3 className="mt-2 text-lg font-semibold">Add Teammates</h3>
                  <p className="mt-1 text-sm text-white/70">
                    Search by name or email, then choose a teammate from the dropdown.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-white/60 hover:text-white"
                  onClick={() => setTeamAddSection(false)}
                  aria-label="Close add teammate popup"
                >
                  ×
                </button>
              </div>

              <div className="mt-5">
                <Combobox
                  value={selectedTeammateUser}
                  onChange={setSelectedTeammateUser}
                  nullable
                  immediate
                >
                  <div className="relative">
                    <Combobox.Input
                      className="h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm font-sans text-white/90 outline-hidden placeholder:text-white/60 focus:border-white/20 focus:ring-2 focus:ring-white/10"
                      placeholder="Add people by name or email"
                      displayValue={(u: AvailableUser | null) => u?.email ?? ""}
                      onChange={(e) => setTeammateQuery(e.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2 text-white/60 hover:text-white">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Combobox.Button>
                  

                    <Combobox.Options className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-white/10 bg-[#020617] py-1 shadow-2xl backdrop-blur-sm">
                      {availableUsersLoading ? (
                        <div className="px-3 py-2 text-sm text-white/50">Loading...</div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-white/50">No matches</div>
                      ) : (
                        filteredUsers.map((u) => (
                          <Combobox.Option
                            key={u.id}
                            value={u}
                            className={({ active }) =>
                              `cursor-pointer px-3 py-2 font-sans ${
                                active ? "bg-white/10 text-white" : "bg-transparent text-white/90"
                              }`
                            }
                          >
                            {({ selected }) => (
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 overflow-hidden rounded-full bg-white/10">
                                  {u.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-white/70">
                                      {(u.full_name?.[0] ?? u.email[0]).toUpperCase()}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium text-white">
                                    {u.full_name ?? u.email}
                                  </div>
                                  {u.full_name ? (
                                    <div className="truncate text-xs text-white/50">{u.email}</div>
                                  ) : null}
                                </div>

                                {selected ? (
                                  <span className="ml-auto text-[10px] uppercase tracking-[0.3em] text-white/60">
                                    Selected
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>

              {selectedTeammateUser ? (
                <div className="mt-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/80">
                  Selected: {selectedTeammateUser.full_name ?? selectedTeammateUser.email}
                </div>
              ) : null}

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTeammateUser(null);
                    setTeammateQuery("");
                    setTeamAddSection(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  disabled={!selectedTeammateUser || sendingInviteLoading}
                  onClick={async () => {
                    await inviteTeammate();
                    setReloadKeyForInvites(reloadKeyForInvites + 1);
                    setTeamAddSection(false);
                    setSelectedTeammateUser(null);
                  }}
                >
                  {sendingInviteLoading ? "Sending..." : "Add teammate"}
                </Button>
              </div>
            </div>
          </div>
        )}
                
        <MessageOverlay message={inviteError} onClose={() => setInviteError(null)} />
        
      </div>
    </main>
  );
}

function GlassCard({
  title,
  children,
  teamAdd = false,
  applicationStatus = "not_started",
  setTeamAddSection,
}: {
  title: string;
  children: React.ReactNode;
  teamAdd?: boolean;
  applicationStatus?: ApplicationStatus;
  setTeamAddSection?: (open: boolean) => void;
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
          </div>
          {(teamAdd && applicationStatus === "submitted") && (
            <Button variant="outline" onClick={() => setTeamAddSection?.(true)}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </div>  

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function TeamRow({id, children} : {id: string, children: React.ReactNode}){
  return (
    <div
      key={id}
      className="group relative overflow-hidden rounded-2xl border border-border bg-background/25 p-4 transition-transform duration-300 hover:-translate-y-0.5"
    >
      {/* shine sweep */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-transparent via-foreground/10 to-transparent blur-md" />
      </div>
      {children}
    </div>
  )
}