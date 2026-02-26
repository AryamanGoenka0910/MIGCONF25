"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import CreatableSelect from "react-select/creatable";
import type { StylesConfig } from "react-select";
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
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Application Fields
  const [school, setSchool] = useState("");
  const [gradYear, setGradYear] = useState(gradYears[0]);
  const [major, setMajor] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, "yes" | "no">>({
    questionOne: "yes",
    questionTwo: "yes",
  });
  const [resume, setResume] = useState<File | null>(null);

  /// RESUME FUNCTIONS
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

  // SUBMIT FUNCTION
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
        form.set("major", major);
        form.set("grad_year", gradYear);
        form.set("how_did_you_hear", howHeard);
        form.set("travel_reimbursement", String(yesNoAnswers.questionOne === "yes"));
        form.set("trading_experience", String(yesNoAnswers.questionTwo === "yes"));
        form.set("resume", resume);

        const res = await fetch("/api/application_routes/application", {
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
          }
        } catch {
          // ignore cache errors
        }

        setMessage(`Application submitted. Reference ID: ${json.id ?? "unknown"}`);
        router.replace("/dashboard");
        router.refresh();
      } catch {
        setMessage("Failed to submit application. Please check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
    })();
  };

  // YES/NO QUESTIONS FUNCTION
  const handleYesNoChange = (id: string, value: "yes" | "no") => {
    setYesNoAnswers((prev) => ({ ...prev, [id]: value }));
  };

  // CHECK SUBMITTED FUNCTION
  useEffect(() => {
    const token = session?.access_token;
    if (loading || !token || !user) {
      setCheckingSubmitted(false);
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
           router.replace("/dashboard");
           router.refresh();
           return;
         }
       }
     } catch {
       // ignore cache read/parse errors
     }

    const controller = new AbortController();
    const run = async () => {
      setCheckingSubmitted(true);
      try {
        const res = await fetch("/api/application_routes/application-info", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const json = (await res.json()) as { submitted?: boolean; error?: string };

        if (!res.ok) {
          setCheckingSubmitted(false);
          return;
        }

        if (json.submitted) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ submitted: true }));
          } catch {
            // ignore cache errors
          }
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ submitted: false }));
        } catch {
          // ignore cache errors
        }
      } catch {
        if (controller.signal.aborted) return;
      } finally {
        if (!controller.signal.aborted) {
          setCheckingSubmitted(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [loading, router, session?.access_token, user]);

  // Check User Session
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
          <h1 className="mt-2 text-3xl font-semibold text-t-primary">Submit your MIG Quant Conference application</h1>
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
              onChange={(option) =>setMajor(option?.value ?? "")}
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
            {resume && <p className="mt-2 text-sm text-white/60">Uploaded: {resume.name}</p>}
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
      </div>
    </main>
  );
}