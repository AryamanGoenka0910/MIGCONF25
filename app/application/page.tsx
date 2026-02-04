"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Combobox } from "@headlessui/react";
import CreatableSelect from "react-select/creatable";
import type { StylesConfig } from "react-select";
import type { DirectoryUser, AvailableUser } from "@/lib/types";
import { Info } from "lucide-react";
import MessageOverlay from "@/components/MessageOverlay";

import { getUserDisplayName } from "@/lib/utils";

const schools = [
  "University of Michigan",
  "University of California, Berkeley",
  "Massachusetts Institute of Technology",
  "Harvard University",
  "Princeton University",
  "Yale University",
  "Columbia University",
  "Cornell University",
  "University of Virginia",
  "University of Washington",
  "University of Texas at Austin",
  "University of California, Los Angeles",
  "Stanford University",
  "University of Pennsylvania",
  "University of Maryland",
  "University of Chicago",
  "University of Notre Dame",
  "Northwestern University",
  "University of Illinois at Urbana-Champaign",
];

const majors = [
  "Computer Science",
  "Electrical Engineering",
  "Applied Mathematics",
  "Physics",
  "Mathematics",
  "Finance",
  "Data Science",
  "Economics",
  "Statistics",
];

const gradYears = Array.from({ length: 4 }, (_, idx) => `${2026 + idx}`);
const howHeardOptions = ["Social media", "Professor or referral", "Newsletter", "Word of Mouth", "Other"];

const yesNoQuestions = [
  {
    id: "questionOne",
    title: "Travel plans",
    body: "Will you require conference-sponsored travel support?",
  },
  {
    id: "questionTwo",
    title: "Previous Trading Experience",
    body: "Do you have any previous trading experience (ie. internships, trading clubs, etc.)?",
  },
];

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB

const creatableSelectComponents = { IndicatorSeparator: () => null };
type SelectOption = { value: string; label: string };

const creatableSelectStyles: StylesConfig<SelectOption, false> = {
  container: (base) => ({
    ...base,
    marginTop: "0.5rem", // mt-2
  }),
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: "0.375rem", // rounded-md
    minHeight: "2.5rem", // h-10
    height: "2.5rem",
    borderColor: state.isFocused ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(255,255,255,0.10)" : "none",
    cursor: "text",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 0.75rem", // px-3
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: "rgba(255,255,255,0.92)",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#020617", // solid
    borderRadius: "0.5rem",
    border: "1px solid rgba(255,255,255,0.10)",
    marginTop: "0.25rem",
    overflow: "hidden",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(255,255,255,0.08)" : "transparent",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.92)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.60)",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.60)",
  }),
};


export default function ApplicationPage() {
  const router = useRouter();
  const { user, loading, session } = useSession();

  const lockedName = getUserDisplayName(user);

  const [checkingSubmitted, setCheckingSubmitted] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [hasTeam, setHasTeam] = useState(false);
  const [hasTeamLoading, setHasTeamLoading] = useState(false);
  const [teamRosterLoading, setTeamRosterLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [school, setSchool] = useState("");
  const [gradYear, setGradYear] = useState(gradYears[0]);
  const [major, setMajor] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [howHeard, setHowHeard] = useState("");
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, "yes" | "no">>({
    questionOne: "yes",
    questionTwo: "yes",
  });

  const [dragActive, setDragActive] = useState(false);

  const [teammates, setTeammates] = useState<DirectoryUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [availableUsersLoading, setAvailableUsersLoading] = useState(false);

  const [teammateQuery, setTeammateQuery] = useState("");
  const [selectedTeammateUser, setSelectedTeammateUser] = useState<AvailableUser | null>(null);

  const [teamMessage, setTeamMessage] = useState<string | null>(null);
  const [teammateInfoOpen, setTeammateInfoOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = teammateQuery.trim().toLowerCase();
    if (!q) return availableUsers;

    return availableUsers.filter((u) => {
      const name = (u.full_name ?? "").toLowerCase();
      const email = u.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [availableUsers, teammateQuery]);

  const handleResumeFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setResume(null);
      return;
    }

    if (files.length > 1) {
      setResume(null);
      setMessage("Please upload only 1 file.");
      return;
    }

    const file = files[0];
    if (file.size > MAX_RESUME_BYTES) {
      setResume(null);
      setMessage("Resume must be 5MB or less.");
      return;
    }

    setMessage(null);
    setResume(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    if (!school || !gradYear || !major || !resume || !howHeard.trim()) {
      setMessage("Please fill every field and upload a resume before submitting.");
      setSubmitting(false);
      return;
    }

    if (resume.size > MAX_RESUME_BYTES) {
      setMessage("Resume must be 5MB or less.");
      setSubmitting(false);
      return;
    }

    const token = session?.access_token;
    if (!token) {
      setMessage("You must be signed in to submit.");
      setSubmitting(false);
      return;
    }

    setMessage("Submitting application...");

    void (async () => {
      try {
        const form = new FormData();
        form.set("school", school);
        form.set("major", major ?? "");
        form.set("grad_year", gradYear);
        form.set("how_did_you_hear", howHeard);
        form.set("teammates", JSON.stringify(teammates.length ? teammates.map((t) => t.id) : null));
        form.set("travel_reimbursement", String(yesNoAnswers.questionOne === "yes"));
        form.set("trading_experience", String(yesNoAnswers.questionTwo === "yes"));
        form.set("has_team", String(hasTeam));
        form.set("resume", resume);

        const res = await fetch("/api/application", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        const json = (await res.json()) as { error?: string; id?: number | string };
        if (!res.ok) {
          setMessage(json.error ?? "Failed to submit application. Please try again.");
          return;
        }

        // Mark as submitted (cache) and invalidate dashboard caches so it refetches team_id/team.
        try {
          if (user?.id) {
            sessionStorage.setItem(
              `migconf.application-submitted.v1:${user.id}`,
              JSON.stringify({ submitted: true })
            );
            sessionStorage.removeItem(`migconf.user.v1:${user.id}`);
            sessionStorage.removeItem(`migconf.team.v1:${user.id}`);
          }
        } catch {
          // ignore cache errors
        }

        setMessage(`Application submitted. Reference ID: ${json.id ?? "unknown"}`);
        setAlreadySubmitted(true);
        router.replace("/dashboard");
        router.refresh();
      } catch {
        setMessage("Failed to submit application. Please check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
    })();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleResumeFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleAddTeammate = () => {
    if (!selectedTeammateUser) {
      return;
    }

    if (teammates.length >= 3) {
      setTeamMessage("You can only add up to 3 teammates.");
      return;
    }

    const alreadyAdded = teammates.some(
      (t) => t.id === selectedTeammateUser.id
    );

    if (alreadyAdded) {
      setTeamMessage("That teammate is already on your list.");
      return;
    }

    setTeammates((prev) => [
      ...prev,
      {id: selectedTeammateUser.id, email: selectedTeammateUser.email, full_name: selectedTeammateUser.full_name},
    ]);

    setTeamMessage("Teammate added.");
    setSelectedTeammateUser(null);
    setTeammateQuery("");
  };

  const handleYesNoChange = (id: string, value: "yes" | "no") => {
    setYesNoAnswers((prev) => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    let mounted = true;

    type TeamApiResponse =
      | { team: null }
      | {
          team: {
            team_id: number;
            members: Array<{
              user_id: string;
              user_email: string;
              user_name: string;
              team_id: number | null;
              role: string;
              application_status?: "confirmed" | "pending";
            }>;
          };
        };

    const run = async () => {
      // If the user is already on a team, load and lock the roster in the teammate UI.
      if (loading || !user || !hasTeam || checkingSubmitted || alreadySubmitted) return;

      const token = session?.access_token;
      if (!token) return;

      setTeamRosterLoading(true);
      setTeamMessage(null);
      try {
        const res = await fetch("/api/team", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as TeamApiResponse;
        if (!mounted) return;

        if (!res.ok) {
          setTeamMessage("Could not load your team. Please refresh.");
          return;
        }

        const members = json.team?.members ?? [];
        const others = members
          .filter((m) => m.user_id !== user.id)
          .map(
            (m) =>
              ({
                id: m.user_id,
                email: m.user_email ?? "",
                full_name: (m.user_name ?? "").trim() || null,
              }) satisfies DirectoryUser
          )
          .filter((m) => m.email);

        setTeammates(others);
        setSelectedTeammateUser(null);
        setTeammateQuery("");
      } catch {
        if (!mounted) return;
        setTeamMessage("Could not load your team. Please refresh.");
      } finally {
        if (mounted) setTeamRosterLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [alreadySubmitted, checkingSubmitted, hasTeam, loading, session?.access_token, user]);

  useEffect(() => {
    let mounted = true;

    const fetchAllUsers = async () => {
      setAvailableUsersLoading(true);
      setTeamMessage(null);

      const token = session?.access_token;
      if (!token) {
        if (mounted) setTeamMessage("Could not load user directory (missing session token).");
        if (mounted) setAvailableUsersLoading(false);
        return;
      }

      const res = await fetch("/api/user-directory", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (mounted) setTeamMessage("Could not load user directory. Please refresh.");
        if (mounted) setAvailableUsersLoading(false);
        return;
      }

      const json = (await res.json()) as { users?: AvailableUser[] };
      const allUsers = Array.isArray(json.users) ? json.users : [];

      if (!mounted) return;

      const myId = user?.id;
      setAvailableUsers(myId ? allUsers.filter((u) => u.id !== myId) : allUsers);
      setAvailableUsersLoading(false);
    };

    if (loading || checkingSubmitted || alreadySubmitted) return;
    if (!user) {
      setAvailableUsersLoading(false);
      return;
    }

    fetchAllUsers();

    return () => {
      mounted = false;
    };
  }, [alreadySubmitted, checkingSubmitted, loading, session?.access_token, user]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (loading) return;
      if (!user) {
        if (mounted) setCheckingSubmitted(false);
        return;
      }

      const token = session?.access_token;
      if (!token) {
        if (mounted) setCheckingSubmitted(false);
        return;
      }

      // If we already know it's submitted in this session, don't hit the DB.
      const cacheKey = `migconf.application-submitted.v1:${user.id}`;
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw) as { submitted?: unknown } | boolean;
          const cachedSubmitted =
            typeof parsed === "boolean" ? parsed : typeof parsed?.submitted === "boolean" ? parsed.submitted : null;
          if (cachedSubmitted === true) {
            setAlreadySubmitted(true);
            router.replace("/dashboard");
            router.refresh();
            return;
          }
        }
      } catch {
        // ignore cache read/parse errors
      }

      setCheckingSubmitted(true);
      try {
        const res = await fetch("/api/application-info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as { submitted?: boolean; error?: string };
        if (!mounted) return;

        if (!res.ok) {
          // Don't block the form forever if this check fails.
          setCheckingSubmitted(false);
          return;
        }

        if (json.submitted) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ submitted: true }));
          } catch {
            // ignore cache errors
          }
          setAlreadySubmitted(true);
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ submitted: false }));
        } catch {
          // ignore cache errors
        }
        setAlreadySubmitted(false);
      } finally {
        if (mounted) setCheckingSubmitted(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [loading, router, session?.access_token, user]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const token = session?.access_token;
      if (!token || !user) return;

      setHasTeamLoading(true);
      try {
        const res = await fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as { user?: { team_id?: number | null } };
        if (!mounted) return;

        if (!res.ok) {
          setHasTeam(false);
          return;
        }

        setHasTeam(Boolean(json.user?.team_id));
      } catch {
        if (!mounted) return;
        setHasTeam(false);
      } finally {
        if (mounted) setHasTeamLoading(false);
      }
    };

    if (loading || checkingSubmitted || alreadySubmitted) return;
    void run();

    return () => {
      mounted = false;
    };
  }, [alreadySubmitted, checkingSubmitted, loading, session?.access_token, user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#032456]">
        <p className="text-lg font-semibold text-white/80">Checking your session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#032456]">
        <p className="text-lg font-semibold text-white/80">Redirecting to sign in...</p>
      </div>
    );
  }

  if (checkingSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#032456]">
        <p className="text-lg font-semibold text-white/80">Checking application status...</p>
      </div>
    );
  }

  if (availableUsersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#032456]">
        <p className="text-lg font-semibold text-white/80">Loading application... please wait 5 seconds</p>
      </div>
    );
  }

  if (hasTeamLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#032456]">
        <p className="text-lg font-semibold text-white/80">Loading application... please wait</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 pt-24">
      <div className="mx-auto w-full max-w-3xl space-y-7 rounded-[32px] border border-white/10 bg-slate-900/60 p-10 shadow-2xl backdrop-blur-sm">
        
        <div className="flex items-center justify-between text-sm text-t-primary/50">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 uppercase tracking-[0.3em] hover:text-t-primary"
          >
            <span aria-hidden="true">←</span>
            Back to dashboard
          </Link>
        </div>
        
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-t-primary/50">Application</p>
          <h1 className="mt-2 text-3xl font-semibold text-t-primary">Create your MIG Quant Conference application</h1>
        </header>


        <form className="text-t-primary" onSubmit={handleSubmit} aria-busy={submitting}>
          <fieldset
            disabled={submitting}
            className={`space-y-6 ${submitting ? "opacity-70" : ""}`}
          >
          <div>
            <Label>Name</Label>
            <Input value={lockedName} disabled className="mt-2" aria-label="Applicant name" />
          </div>

          <div>
            <Label>School / Institution</Label>
            <CreatableSelect
                options={schools.map((s) => ({ value: s, label: s }))}
                placeholder="Choose or type a school"
                value={school ? { value: school, label: school } : null}
                onChange={(option) => setSchool(option?.value ?? "")}
                components={creatableSelectComponents}
                classNamePrefix="react-select"
                styles={creatableSelectStyles}
            />
          </div>

          <div>
            <Label>Majors</Label>
            <CreatableSelect
              options={majors.map((m) => ({ value: m, label: m }))}
              placeholder="Select or type majors"
              value={major ? { value: major, label: major } : null}
              onChange={(option) =>setMajor(option?.value ?? null)}
              components={creatableSelectComponents}
              classNamePrefix="react-select"
              styles={creatableSelectStyles}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label>Graduation year</Label>
              <CreatableSelect
                options={gradYears.map((y) => ({ value: y, label: y }))}
                placeholder="Select grad year"
                value={gradYear ? { value: gradYear, label: gradYear } : null}
                onChange={(option) => setGradYear(option?.value ?? gradYears[0])}
                components={creatableSelectComponents}
                classNamePrefix="react-select"
                styles={creatableSelectStyles}
              />
            </div>

            <div>
              <Label>How did you hear about us?</Label>
              <CreatableSelect
                options={howHeardOptions.map((o) => ({ value: o, label: o }))}
                placeholder="Select or type an option"
                value={howHeard ? { value: howHeard, label: howHeard } : null}
                onChange={(option) => setHowHeard(option?.value ?? "")}
                components={creatableSelectComponents}
                classNamePrefix="react-select"
                styles={creatableSelectStyles}
              />
            </div>
          </div>

          {/* Teammates */}
          <div className="rounded-2xl border border-white/10 bg-[#031c3f]/50 p-4">
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Teammates</p>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                onClick={() => setTeammateInfoOpen(true)}
                aria-label="Teammate info"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            {hasTeam ? (
              <p className="mt-2 text-xs text-white/60">
                You&apos;re already on a team. Your teammates are shown below and can&apos;t be edited here.
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {teammates.map((member) => (
                <span
                  key={`${member.id}`}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white"
                >
                  <span>{member.full_name}</span>
                  {!hasTeam ? (
                    <button
                      type="button"
                      onClick={() => setTeammates((prev) => prev.filter((t) => t.full_name !== member.full_name))}
                      className="ml-1 text-white/60 hover:text-white"
                      aria-label={`Remove teammate ${member.full_name}`}
                    >
                      ×
                    </button>
                  ) : null}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full">
                <Combobox
                  value={selectedTeammateUser}
                  onChange={setSelectedTeammateUser}
                  nullable
                  immediate
                  disabled={hasTeam}
                >
                  <div className="relative">
                    <Combobox.Input
                      className="h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm font-sans text-white/90 outline-hidden placeholder:text-white/60 focus:border-white/20 focus:ring-2 focus:ring-white/10"
                      placeholder={hasTeam ? "Team locked" : "Add people by name or email"}
                      displayValue={(u: AvailableUser | null) => u?.email ?? ""}
                      onChange={(e) => setTeammateQuery(e.target.value)}
                      disabled={hasTeam}
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
                  </div>

                  <Combobox.Options className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-white/10 bg-[#020617] py-1 shadow-2xl backdrop-blur-sm">
                    {filteredUsers.length === 0 ? (
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
                </Combobox>
              </div>

              <Button
                type="button"
                className="w-full text-xs uppercase tracking-[0.4em] sm:w-auto"
                onClick={handleAddTeammate}
                disabled={hasTeam || !selectedTeammateUser}
              >
                Add
              </Button>
            </div>

            {teamRosterLoading ? (
              <p className="mt-2 text-xs text-white/60">Loading your team…</p>
            ) : null}
            {teamMessage && <p className="mt-2 text-xs text-accent">{teamMessage}</p>}
          </div>

          {/* Resume upload */}
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/60">Upload resume</label>
            <label
              htmlFor="resume-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`mt-2 flex flex-col items-center justify-center rounded-2xl border-2 px-4 py-8 text-sm text-white transition ${
                dragActive ? "border-accent bg-white/5" : "border-white/20 bg-black/40 hover:border-white/55 transition-all duration-100"
              }`}
            >
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                multiple={false}
                onChange={(event) => {
                  handleResumeFiles(event.currentTarget.files);
                  // allow re-selecting the same file after an invalid attempt
                  if (event.currentTarget.files && event.currentTarget.files.length !== 1) {
                    event.currentTarget.value = "";
                  }
                }}
                className="sr-only"
              />
              <div className="text-center">
                <p className="font-semibold uppercase tracking-[0.3em] text-white/80">Drag &amp; drop resume</p>
                <p className="mt-2 text-xs text-white/60">or click to browse</p>
              </div>
            </label>
            {resume && <p className="mt-2 text-xs text-white/60">Uploaded: {resume.name}</p>}
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-white/60">Quick questions</h3>

            {yesNoQuestions.map((question) => (
              <div key={question.id} className="space-y-2">
                <p className="text-sm font-semibold text-white">{question.title}</p>
                <p className="text-xs text-white/60">{question.body}</p>
                <div className="flex gap-4">
                  {(["yes", "no"] as const).map((value) => (
                    <label key={value} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                      <Input
                        type="radio"
                        name={question.id}
                        value={value}
                        checked={yesNoAnswers[question.id] === value}
                        onChange={() => handleYesNoChange(question.id, value)}
                        className="h-4 w-4 rounded-full border-white/50 bg-transparent text-white accent-accent"
                      />
                      {value === "yes" ? "Yes" : "No"}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              className="uppercase tracking-[0.4em] hover:bg-primary/50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit application"}
            </Button>
          </div>
          </fieldset>
        </form>

        <MessageOverlay message={message} onClose={() => setMessage(null)} />

        {/* Teammate info overlay */}
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
                    <p>
                      You can add up to <span className="font-semibold">3</span> teammates. Teams are set when you
                      submit your application. The compeition is a team based event, so make sure all of your teammates are interested in the event and have submitted their applications.
                      If you do not have a team, we will match you with a team after acceptance to the conference.
                    </p>
                    <p className="text-white/70">
                      If you&apos;re already on a team, this section is locked and you can&apos;t add or remove people
                      here. Please contact the conference staff if you have any questions or concerns.
                    </p>
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
      </div>
    </main>
  );
}