"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

const inputStyles = "mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-t-primary outline-hidden focus:border-accent transition-all duration-200 hover:border-white";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && !submitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("If an account exists for that email, you’ll receive a password reset link shortly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#032456]">
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg rounded-[40px] bg-muted/80 p-8 shadow-2xl">
          <h1 className="text-4xl font-semibold text-t-primary">Reset Password</h1>
          <p className="mt-3 text-xl font-semibold uppercase tracking-[0.2em] text-t-primary/70">
            We&apos;ll email you a reset link
          </p>

          {/* Form */}
          <div className="mt-10">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-[0.65rem] uppercase tracking-[0.3em] text-t-primary/70">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className={inputStyles}
                  required
                />
                <p className="mt-2 text-xs text-t-primary/60">
                  Use the email you signed up with. We won&apos;t reveal whether an account exists.
                </p>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-t-primary transition hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Working..." : "Send reset link"}
              </button>
            </form>

            {message && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={() => setMessage(null)}
                role="dialog"
                aria-modal="true"
              >
                <div
                  className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-white/90">{message}</p>
                    <button
                      type="button"
                      className="rounded-md px-2 py-1 text-white/60 hover:text-white"
                      onClick={() => setMessage(null)}
                      aria-label="Close message"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-t-primary/60"
                onClick={() => router.push("/signin")}
              >
                Back to <span className="underline underline-offset-4 hover:text-t-primary">Sign in</span>
              </button>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-t-primary hover:text-t-primary/50"
                onClick={() => router.push("/")}
              >
                Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


