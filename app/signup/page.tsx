"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useSession } from "@/hooks/useSession";

type Requirement = {
  label: string;
  test: (pw: string) => boolean;
};

const requirements: Requirement[] = [
  { label: "At least 12 characters", test: (pw) => pw.length >= 12 },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw) => /\d/.test(pw) },
  { label: "One special character (!@#$%^&*...)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

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

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading } = useSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const requirementState = useMemo(() => {
    const results = requirements.map((r) => r.test(password));
    const met = results.filter(Boolean).length;
    return { results, met };
  }, [password]);

  const passwordsMatch = confirm.length > 0 && password === confirm;

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    requirementState.met === requirements.length &&
    password === confirm &&
    agreed &&
    !submitting;

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
      if (requirementState.met !== requirements.length) {
        setMessage("Please meet all password requirements.");
        return;
      }
      if (password !== confirm) {
        setMessage("Passwords do not match.");
        return;
      }
      if (!agreed) {
        setMessage("Please agree to the terms and privacy policy.");
        return;
      }

      console.log("Submitting signup...");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Check your inbox for a confirmation email before signing in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#032456]">
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg rounded-[40px] bg-slate-800/80 p-8 shadow-2xl">
          <h1 className="text-4xl font-semibold text-white">Create Profile</h1>
          <p className="mt-3 text-xl font-semibold uppercase tracking-[0.2em] text-white/70">
            Join the MIG Quant Conference
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
              {/* Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
                    First Name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[color:var(--accent)]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
                    Last Name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[color:var(--accent)]"
                    required
                  />
                </div>
              </div>

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

                {/* Requirements box (like screenshot) */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                      Password Requirements
                    </p>
                    <p className="text-xs text-white/60">
                      {requirementState.met}/{requirements.length}
                    </p>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[color:var(--accent)] transition-all"
                      style={{
                        width: `${(requirementState.met / requirements.length) * 100}%`,
                      }}
                    />
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-white/70">
                    {requirements.map((r, idx) => {
                      const ok = requirementState.results[idx];
                      return (
                        <li key={r.label} className="flex items-center gap-3">
                          <span
                            className={[
                              "flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                              ok
                                ? "border-[color:var(--accent)] bg-[color:var(--accent)]/20 text-white"
                                : "border-white/15 bg-white/5 text-white/40",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            {ok ? "✓" : "×"}
                          </span>
                          <span className={ok ? "text-white/85" : "text-white/55"}>{r.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Confirm */}
              <div>
                 <label className="text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
                  Confirm Password
                </label>
                 <div className="relative mt-2">
                   <input
                     type={showConfirm ? "text" : "password"}
                     value={confirm}
                     onChange={(e) => setConfirm(e.target.value)}
                     placeholder="••••••••••••"
                     className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-[color:var(--accent)]"
                     required
                   />
                   <button
                     type="button"
                     onClick={() => setShowConfirm((prev) => !prev)}
                     className="absolute inset-y-0 right-3 flex items-center justify-center rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                     aria-label={showConfirm ? "Hide password" : "Show password"}
                   >
                     {showConfirm ? (
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
                {confirm.length > 0 && (
                  <p className={`mt-2 text-xs ${passwordsMatch ? "text-white/70" : "text-red-200"}`}>
                    {passwordsMatch ? "Passwords match." : "Passwords do not match."}
                  </p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 pt-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                  required
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/terms")}
                    className="text-[color:var(--accent)] underline underline-offset-4"
                  >
                    terms and conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/privacy")}
                    className="text-[color:var(--accent)] underline underline-offset-4"
                  >
                    privacy policy
                  </button>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[color:var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Working..." : "Create account"}
              </button>
            </form>

            {message && <p className="mt-4 text-center text-sm text-white/80">{message}</p>}

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60"
                onClick={() => router.push("/signin")}
              >
                Already have an account? <span className="underline underline-offset-4 hover:text-white/80">Sign in</span>
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