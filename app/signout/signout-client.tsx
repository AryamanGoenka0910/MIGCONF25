"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundGlow from "@/components/background-glow";
import { localSignOut } from "@/lib/signout";

function clearMigconfSessionCache() {
  try {
    // Only remove keys owned by this app.
    // (Dashboard caches user/team/submitted in sessionStorage with this prefix.)
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("migconf.")) {
        sessionStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage errors (privacy mode, disabled storage, etc.)
  }
}

export default function SignOutClient({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Double-check it's an internal URL.
      const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/signin";

      try {
        clearMigconfSessionCache();
        await localSignOut();
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to sign out.");
      } finally {
        if (cancelled) return;
        clearMigconfSessionCache();
        router.replace(safeReturnTo);
        router.refresh();
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, returnTo]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-t-primary/70">
            Signing out
          </div>
          <div className="mt-3 text-2xl font-semibold text-t-primary">Clearing your session…</div>
          {error ? (
            <div className="mt-6 text-sm text-t-primary/70">
              {error} Redirecting you anyway…
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

