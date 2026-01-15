"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useSession } from "@/hooks/useSession";

function GooglePhotosIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M12 12c0-2.2 1.8-4 4-4h2a4 4 0 0 0-6-3.46V12Z" />
      <path fill="#FBBC05" d="M12 12h8a4 4 0 0 0-2-4h-2c-2.2 0-4 1.8-4 4Z" />
      <path fill="#34A853" d="M12 12c2.2 0 4 1.8 4 4v2a4 4 0 0 0 3.46-6H12Z" />
      <path fill="#4285F4" d="M12 12v8a4 4 0 0 0 4-2v-2c0-2.2-1.8-4-4-4Z" />
      <path fill="#34A853" d="M12 12c0 2.2-1.8 4-4 4H6a4 4 0 0 0 6 3.46V12Z" />
      <path fill="#FBBC05" d="M12 12H4a4 4 0 0 0 2 4h2c2.2 0 4-1.8 4-4Z" />
      <path fill="#EA4335" d="M12 12c-2.2 0-4-1.8-4-4V6a4 4 0 0 0-3.46 6H12Z" />
      <path fill="#4285F4" d="M12 12V4a4 4 0 0 0-4 2v2c0 2.2 1.8 4 4 4Z" />
      <circle cx="12" cy="12" r="2.3" fill="white" opacity="0.9" />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const { user, loading } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogle = async () => {
    setMessage(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { prompt: "consent" },
      },
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#032456]">
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg rounded-[40px] bg-slate-800/80 p-8 shadow-2xl">
          <h1 className="text-4xl font-semibold text-white">Welcome Back</h1>
          <p className="mt-3 text-xl font-semibold uppercase tracking-[0.2em] text-white/70">
            Log In to the MIG Quant Conference
          </p>

          {/* Google */}
          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-[color:var(--accent)]/90"
            >
              <GooglePhotosIcon />
              Continue with Google
            </button>

            <div className="flex items-center gap-4 text-white/50">
              <div className="h-px flex-1 bg-white/15" />
              <span className="text-xs uppercase tracking-[0.3em]">or continue with email</span>
              <div className="h-px flex-1 bg-white/15" />
            </div>
          </div>

          {/* Form */}
          <div className="mt-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[color:var(--accent)]"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-[color:var(--accent)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center justify-center rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10 10 0 0 1 6.06 6.06" />
                        <path d="M1 1l22 22" />
                        <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[color:var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Working..." : "Sign in"}
              </button>
            </form>

            {message && <p className="mt-4 text-center text-sm text-white/80">{message}</p>}

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
                onClick={() => router.push("/signup")}
              >
                Need an account? <span className="underline underline-offset-4 hover:text-white/80">Sign up</span>
              </button>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-white hover:text-white/80"
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