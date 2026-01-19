"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useSession } from "@/hooks/useSession";

import EyeOnIcon from "@/components/auth-components/see-password";
import EyeOffIcon from "@/components/auth-components/hide-password";

const inputStyles = "mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-t-primary outline-hidden focus:border-accent transition-all duration-200 hover:border-white"
const visibilityButtonStyles = "mt-2 absolute inset-y-0 right-3 flex items-center justify-center rounded-full bg-white/10 p-2 text-t-primary transition hover:bg-white/20"


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

  // Handle OAuth redirects explicitly (we disabled detectSessionInUrl in the client).
  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const type = params.get("type");
      if (!code || type === "recovery") return;

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setMessage(error.message);
        return;
      }

      // Clean up the URL so the code can't be reused on refresh.
      window.history.replaceState({}, "", window.location.pathname);
    };
    run();
  }, []);

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
        <div className="w-full max-w-lg rounded-[40px] bg-muted/80 p-8 shadow-2xl">
          <h1 className="text-4xl font-semibold text-t-primary">Welcome Back</h1>
          <p className="mt-3 text-xl font-semibold uppercase tracking-[0.2em] text-t-primary/70">
            Log In to the MIG Quant Conference
          </p>

          {/* Google */}
          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-t-primary transition hover:bg-accent/70"
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
              </div>

              {/* Password */}
              <div>
              <div className="flex items-center justify-between">
                <label className="text-[0.65rem] uppercase tracking-[0.3em] text-t-primary/70">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-t-primary/60 hover:text-t-primary underline underline-offset-4"
                >
                  Forgot password?
                </button>
              </div>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={inputStyles + " pr-12"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={visibilityButtonStyles}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOnIcon />
                    ) : (
                      <EyeOffIcon />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-t-primary transition hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Working..." : "Sign in"}
              </button>
            </form>

            {message && 
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
              }

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-t-primary/60"
                onClick={() => router.push("/signup")}
              >
                Need an account? <span className="underline underline-offset-4 hover:text-t-primary">Sign up</span>
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