"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { localSignOut } from "@/lib/signout";

import EyeOnIcon from "@/components/auth-components/see-password";
import EyeOffIcon from "@/components/auth-components/hide-password";

const inputStyles =
  "mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-t-primary outline-hidden focus:border-accent transition-all duration-200 hover:border-white";
const visibilityButtonStyles =
  "mt-2 absolute inset-y-0 right-3 flex items-center justify-center rounded-full bg-white/10 p-2 text-t-primary transition hover:bg-white/20";

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

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [checkingLink, setCheckingLink] = useState(true);
  const [linkOk, setLinkOk] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<"code" | "token_hash" | "implicit" | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [recoveryTokenHash, setRecoveryTokenHash] = useState<string | null>(null);
  const [recoveryAccessToken, setRecoveryAccessToken] = useState<string | null>(null);
  const [recoveryRefreshToken, setRecoveryRefreshToken] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const requirementState = useMemo(() => {
    const results = requirements.map((r) => r.test(password));
    const met = results.filter(Boolean).length;
    return { results, met };
  }, [password]);

  const passwordsMatch = confirm.length > 0 && password === confirm;

  const canSubmit =
    !checkingLink &&
    linkOk &&
    requirementState.met === requirements.length &&
    password === confirm &&
    !submitting;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setCheckingLink(true);
      setLinkOk(false);
      setRecoveryMethod(null);
      setRecoveryCode(null);
      setRecoveryTokenHash(null);
      setRecoveryAccessToken(null);
      setRecoveryRefreshToken(null);

      try {
        const query = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

        const type = query.get("type") ?? hash.get("type");
        const code = query.get("code");
        const tokenHash = query.get("token_hash") ?? query.get("token");
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        let ok = false;
        let method: "code" | "token_hash" | "implicit" | null = null;

        if (type === "recovery" && code) {
          ok = true;
          method = "code";
        } else if (type === "recovery" && tokenHash) {
          ok = true;
          method = "token_hash";
        } else if (type === "recovery" && accessToken && refreshToken) {
          ok = true;
          method = "implicit";
        }

        if (!cancelled) {
          setRecoveryMethod(method);
          setRecoveryCode(code);
          setRecoveryTokenHash(tokenHash);
          setRecoveryAccessToken(accessToken);
          setRecoveryRefreshToken(refreshToken);
          setLinkOk(ok);
        }

        if (!cancelled && !ok) {
          setMessage(
            "This reset link is invalid or expired. Please request a new password reset email."
          );
        }
      } finally {
        if (!cancelled) setCheckingLink(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (!linkOk) {
        setMessage("This reset link is invalid or expired. Please request a new password reset email.");
        return;
      }
      if (requirementState.met !== requirements.length) {
        setMessage("Please meet all password requirements.");
        return;
      }
      if (password !== confirm) {
        setMessage("Passwords do not match.");
        return;
      }

      // Establish a temporary session ONLY when the user submits,
      // so simply opening this page doesn't authenticate them.
      if (recoveryMethod === "code") {
        if (!recoveryCode) {
          setMessage("Missing recovery code. Please request a new password reset email.");
          return;
        }
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(recoveryCode);
        if (exchangeError) {
          setMessage(exchangeError.message);
          return;
        }
      } else if (recoveryMethod === "token_hash") {
        if (!recoveryTokenHash) {
          setMessage("Missing recovery token. Please request a new password reset email.");
          return;
        }
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: recoveryTokenHash,
        });
        if (verifyError) {
          setMessage(verifyError.message);
          return;
        }
      } else if (recoveryMethod === "implicit") {
        if (!recoveryAccessToken || !recoveryRefreshToken) {
          setMessage("Missing recovery session. Please request a new password reset email.");
          return;
        }
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: recoveryAccessToken,
          refresh_token: recoveryRefreshToken,
        });
        if (setSessionError) {
          setMessage(setSessionError.message);
          return;
        }
      } else {
        setMessage("This reset link is invalid or expired. Please request a new password reset email.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
        return;
      }

      // Don't keep the recovery session around; otherwise the user appears logged in.
      await localSignOut();

      setMessage("Password updated successfully. You can now sign in.");
      router.replace("/signin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg rounded-[40px] p-8 bg-muted/80 shadow-2xl">
          <h1 className="text-4xl font-semibold text-t-primary">Set New Password</h1>
          <p className="mt-3 text-xl font-semibold uppercase tracking-[0.2em] text-t-primary/70">
            Choose a strong password
          </p>

          {/* Form */}
          <div className="mt-10">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Password */}
              <div>
                <label className="text-[0.65rem] uppercase tracking-[0.3em] text-t-primary/70">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={inputStyles + " pr-12"}
                    required
                    disabled={checkingLink || !linkOk}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={visibilityButtonStyles}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={checkingLink || !linkOk}
                  >
                    {showPassword ? <EyeOnIcon /> : <EyeOffIcon />}
                  </button>
                </div>

                {/* Requirements box */}
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
                    disabled={checkingLink || !linkOk}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className={visibilityButtonStyles}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    disabled={checkingLink || !linkOk}
                  >
                    {showConfirm ? <EyeOnIcon /> : <EyeOffIcon />}
                  </button>
                </div>

                {confirm.length > 0 && (
                  <p className={`mt-2 text-xs ${passwordsMatch ? "text-white/70" : "text-red-200"}`}>
                    {passwordsMatch ? "Passwords match." : "Passwords do not match."}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-accent/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {checkingLink ? "Validating link..." : submitting ? "Working..." : "Reset password"}
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
                onClick={() => router.push("/forgot-password")}
              >
                Need a new link?{" "}
                <span className="underline underline-offset-4 hover:text-t-primary">Request reset</span>
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


