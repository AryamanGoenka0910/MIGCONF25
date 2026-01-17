"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

type ApplicationStatus = "not_started" | "drafting" | "submitted";

const teamMembers = [
  {
    name: "Nina Patel",
    status: "Confirmed",
  },
  {
    name: "Jordan Liu",
    status: "Confirmed",
  },
  {
    name: "Avery King",
    status: "Pending mentor approval",
  },
];

const statusBadges: Record<ApplicationStatus, string> = {
  not_started: "bg-red-500/20 text-red-300",
  drafting: "bg-yellow-500/20 text-yellow-300",
  submitted: "bg-green-500/20 text-green-300",
};

const statusLabels: Record<ApplicationStatus, string> = {
  not_started: "Not started",
  drafting: "Drafting",
  submitted: "Submitted",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, role } = useSession();
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>("not_started");
  const [summary, setSummary] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const handleStart = () => {
    setApplicationStatus("drafting");
    setNotification("You can now build your application draft.");
  };

  const handleSaveDraft = () => {
    setNotification("Draft saved locally. Keep refining!");
  };

  const handleSubmit = () => {
    if (summary.trim().length === 0) {
      setNotification("Add a quick summary before submitting.");
      return;
    }

    setApplicationStatus("submitted");
    setNotification("Application submitted! Expect a confirmation email shortly.");
  };

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

  const metadata = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const displayName =
    metadata.full_name ??
    [metadata.first_name, metadata.last_name].filter(Boolean).join(" ").trim() ??
    user?.email ??
    "Guest";

  const quickStats = [
    { label: "Role", value: role },
    { label: "Applications started", value: applicationStatus === "not_started" ? "0" : "1" },
    { label: "Team members", value: `${teamMembers.length}` },
  ];

  return (
    <main className="min-h-screen bg-[#032456] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[32px] border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur mt-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">Hello</p>
              <h1 className="text-3xl font-semibold">
                {displayName} <span className="text-white/60">({role})</span>
              </h1>
              <p className="text-sm text-white/60">
                Here is your staging area for everything MIG Quant Conference-related.
              </p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push("/application")}
                    className="rounded-2xl bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-[color:var(--accent)]/90"
                >
                    Start Application
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="rounded-2xl border border-white/20 px-4 py-2 text-sm uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40"
                >
                    Explore site
                </button>
                <button
                    type="button"
                    onClick={() => supabaseSignOut(router)}
                    className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
                >
                    Sign out
                </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl">
            <header className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Profile</p>
            </header>
            <div className="mt-6 space-y-3 text-sm text-white/70">
                <p>
                    <span className="font-semibold text-white">Name:</span> {displayName}
                </p>
                <p>
                    <span className="font-semibold text-white">Email:</span> {user?.email ?? "Unavailable"}
                </p>
                <p>
                    <span className="font-semibold text-white">Conference role:</span> {role}
                </p>
                <p>
                    <span className="font-semibold text-white">Member since:</span>{" "}
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="rounded-2xl bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-[color:var(--accent)]/90"
              >
                Update profile
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl">
            <header>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Team</p>
            </header>
            <div className="mt-5 space-y-4">
              {teamMembers.map((member) => (
                <div key={member.name} className="rounded-2xl border border-white/10 bg-[#031c3f]/60 p-4">
                  <div className="flex items-center justify-between">
                        <p className="text-base font-semibold">{member.name}</p>
                        <span className="text-xs text-white/60">{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

async function supabaseSignOut(router: ReturnType<typeof useRouter>) {
  const { supabase } = await import("@/lib/supabase-client");
  await supabase.auth.signOut();
  router.push("/signin");
}

