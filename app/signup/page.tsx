"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useSession } from "@/hooks/useSession";
import BackgroundGlow from "@/components/background-glow";
import MessageOverlay from "@/components/MessageOverlay";

import EyeOnIcon from "@/components/auth-components/see-password";
import EyeOffIcon from "@/components/auth-components/hide-password";

const inputStyles = "mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-t-primary outline-hidden focus:border-accent transition-all duration-200 hover:border-white"
const visibilityButtonStyles = "mt-2 absolute inset-y-0 right-3 flex items-center justify-center rounded-full bg-white/10 p-2 text-t-primary transition hover:bg-white/20"

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

      // MAKE SURE OF NO DUPLICATE EMAILS
      const { data, error } = await supabase.auth.signUp({
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

      if (data.user?.identities?.length === 0) {
        setMessage("Account already exists. Please sign in.");
        return;
      }

      setMessage("Check your inbox for a confirmation email before signing in.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      setAgreed(false);
      setShowPassword(false);
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div className="min-h-screen">
      <BackgroundGlow />

      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg rounded-[40px] p-8 bg-muted">
          <h1 className="text-4xl font-semibold text-t-primary">Create Profile</h1>
          <p className="mt-3 text-xl font-semibold uppercase tracking-[0.2em] text-t-primary/70">Join the MIG Quant Conference</p>
    
          {/* Google */}
          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-accent/70"
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
                  <label className="text-[0.65rem] uppercase tracking-[0.3em] text-t-primary/70">
                    First Name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className={inputStyles}
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.65rem] uppercase tracking-[0.3em] text-t-primary/70">
                    Last Name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={inputStyles}
                    required
                  />
                </div>
              </div>

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
                <label className="text-[0.65rem] uppercase tracking-[0.3em] text-t-primary/70">
                  Password
                </label>
                <div className="relative">
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
                      className="h-full rounded-full bg-accent transition-all"
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
                                ? "border-accent bg-accent/20 text-white"
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
                 <div className="relative">
                   <input
                     type={showConfirm ? "text" : "password"}
                     value={confirm}
                     onChange={(e) => setConfirm(e.target.value)}
                     placeholder="••••••••••••"
                     className={inputStyles + " pr-12"}
                     required
                   />
                   <button
                     type="button"
                     onClick={() => setShowConfirm((prev) => !prev)}
                     className={visibilityButtonStyles}
                     aria-label={showConfirm ? "Hide password" : "Show password"}
                   >
                     {showConfirm ? (
                       <EyeOnIcon />
                     ) : (
                       <EyeOffIcon />
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
              <label className="flex items-start gap-3 pt-2 text-sm text-t-primary/70">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10"
                  required
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/terms")}
                    className="text-accent underline underline-offset-4"
                  >
                    terms and conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/privacy")}
                    className="text-accent underline underline-offset-4"
                  >
                    privacy policy
                  </button>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Working..." : "Create account"}
              </button>
            </form>

            <MessageOverlay message={message} onClose={() => setMessage(null)} />

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-t-primary/60"
                onClick={() => router.push("/signin")}
              >
                Already have an account? <span className="underline underline-offset-4 hover:text-t-primary">Sign in</span>
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