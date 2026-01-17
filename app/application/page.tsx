"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Combobox } from "@headlessui/react";
import CreatableSelect from "react-select/creatable";
import type { MultiValue } from "react-select";


const schools = [
  "University of Michigan",
  "Massachusetts Institute of Technology",
  "Stanford University",
  "University of Chicago",
  "Northwestern University",
];

const majors = [
  "Computer Science",
  "Applied Mathematics",
  "Data Science",
  "Economics",
  "Engineering",
  "Statistics",
];

const gradYears = Array.from({ length: 6 }, (_, idx) => `${2026 + idx}`);

const defaultTeammates = [
  { name: "Nina Patel", status: "Confirmed" },
  { name: "Jordan Liu", status: "Confirmed" },
];

const howHeardOptions = ["Social media", "Professor or referral", "Newsletter", "Other"];

const yesNoQuestions = [
  {
    id: "questionOne",
    title: "Travel plans",
    body: "Will you require conference-sponsored travel support?",
  },
  {
    id: "questionTwo",
    title: "Presentation readiness",
    body: "Are you comfortable delivering a 10-minute pitch at the conference?",
  },
];

const sampleAvailableUsers: AvailableUser[] = [
  {
    id: "1",
    email: "nina.patel@example.com",
    full_name: "Nina Patel",
  },
  {
    id: "2",
    email: "jordan.liu@example.com",
    full_name: "Jordan Liu",
  },
  {
    id: "3",
    email: "avery.king@example.com", 
    full_name: "Avery King",
  },
  {
    id: "4",
    email: "maya.singh@example.com",
    full_name: "Maya Singh",
  },
];


type AvailableUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null; // optional if you add it later
};

type SelectOption = { value: string; label: string };

const creatableSelectComponents = { IndicatorSeparator: () => null };

const creatableSelectStyles = {
  container: (base: any) => ({
    ...base,
    marginTop: "0.5rem", // mt-2
  }),
  control: (base: any, state: any) => ({
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
  valueContainer: (base: any) => ({
    ...base,
    padding: "0 0.75rem", // px-3
  }),
  input: (base: any) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: "rgba(255,255,255,0.92)",
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "#020617", // solid
    borderRadius: "0.5rem",
    border: "1px solid rgba(255,255,255,0.10)",
    marginTop: "0.25rem",
    overflow: "hidden",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(255,255,255,0.08)" : "transparent",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "rgba(255,255,255,0.92)",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "rgba(255,255,255,0.60)",
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: "rgba(255,255,255,0.60)",
  }),
};

const creatableSelectStylesMulti = {
  ...creatableSelectStyles,
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: "9999px",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "rgba(255,255,255,0.92)",
    fontSize: "0.75rem",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    paddingLeft: "0.75rem",
    paddingRight: "0.25rem",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "rgba(255,255,255,0.70)",
    borderRadius: "9999px",
    paddingRight: "0.5rem",
    paddingLeft: "0.25rem",
    cursor: "pointer",
  }),
};

export default function ApplicationPage() {
  const router = useRouter();
  const { user } = useSession();

  const metadata = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const lockedName = metadata.full_name ?? user?.email ?? "Unnamed applicant";

  const [school, setSchool] = useState("");
  const [gradYear, setGradYear] = useState(gradYears[0]);
  const [majorTags, setMajorTags] = useState<string[]>([]);
  const [resume, setResume] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);

  const [teammates, setTeammates] = useState(defaultTeammates);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);

  // Option A state (HeadlessUI Combobox)
  const [teammateQuery, setTeammateQuery] = useState("");
  const [selectedTeammateUser, setSelectedTeammateUser] = useState<AvailableUser | null>(null);

  const [teamMessage, setTeamMessage] = useState<string | null>(null);
  const [howHeard, setHowHeard] = useState("");
  const [yesNoAnswers, setYesNoAnswers] = useState<Record<string, "yes" | "no">>({
    questionOne: "yes",
    questionTwo: "yes",
  });

  const filteredUsers = useMemo(() => {
    const q = teammateQuery.trim().toLowerCase();
    if (!q) return availableUsers;

    return sampleAvailableUsers.filter((u) => {
      const name = (u.full_name ?? "").toLowerCase();
      const email = u.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [availableUsers, teammateQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!school || !gradYear || !majorTags.length || !resume || !howHeard.trim()) {
      setMessage("Please fill every field and upload a resume before submitting.");
      return;
    }

    setMessage("Application submitted (mock). We'll handle uploads on the server later.");
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) setResume(file);
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
      setTeamMessage("Select someone from the dropdown first.");
      return;
    }

    const alreadyAdded = teammates.some(
      (t) => t.name === (selectedTeammateUser.full_name ?? selectedTeammateUser.email)
    );
    if (alreadyAdded) {
      setTeamMessage("That teammate is already on your list.");
      return;
    }

    setTeammates((prev) => [
      ...prev,
      { name: selectedTeammateUser.full_name ?? selectedTeammateUser.email, status: "Invited" },
    ]);

    setTeamMessage("Teammate added.");
    setSelectedTeammateUser(null);
    setTeammateQuery("");
  };

  const handleYesNoChange = (id: string, value: "yes" | "no") => {
    setYesNoAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveDraftAction = () => {
    setMessage("Draft saved locally.");
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("id, email, full_name").limit(50);
      if (!error) setAvailableUsers((data ?? []) as AvailableUser[]);
    };

    fetchUsers();
  }, []);

  return (
    <main className="min-h-screen bg-[#031232] px-4 py-16 text-white">
      <div className="mx-auto w-full max-w-3xl space-y-7 rounded-[32px] border border-white/10 bg-slate-900/60 p-10 shadow-2xl backdrop-blur">
        
        <div className="flex items-center justify-between text-sm text-white/60">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 uppercase tracking-[0.3em] hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Back to dashboard
          </Link>
        </div>
        
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Application</p>
          <h1 className="mt-2 text-3xl font-semibold">Create your MIG Quant Conference application</h1>
        </header>


        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label>Name</Label>
            <Input value={lockedName} disabled className="mt-2" aria-label="Applicant name" />
          </div>

          <div>
            <Label>School / Institution</Label>
            <CreatableSelect
                options={schools.map((s) => ({ value: s, label: s }))}
                placeholder="Choose or type a school"
                onChange={(option) => setSchool(option?.value ?? "")}
                components={creatableSelectComponents}
                classNamePrefix="react-select"
                styles={creatableSelectStyles}
            />
          </div>

          <div>
            <Label>Majors (tagged)</Label>
            <CreatableSelect
              isMulti
              options={majors.map((m) => ({ value: m, label: m }))}
              placeholder="Select or type majors"
              value={majorTags.map((t) => ({ value: t, label: t }))}
              onChange={(newValue: MultiValue<SelectOption>) =>
                setMajorTags(newValue.map((v) => v.value))
              }
              components={creatableSelectComponents}
              classNamePrefix="react-select"
              styles={creatableSelectStylesMulti}
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
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Teammates</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {teammates.map((member) => (
                <span
                  key={`${member.name}-${member.status}`}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white"
                >
                  <span>{member.name}</span>
                  <span className="text-[10px] tracking-[0.3em] text-white/60">{member.status}</span>
                  <button
                    type="button"
                    onClick={() => setTeammates((prev) => prev.filter((t) => t.name !== member.name))}
                    className="ml-1 text-white/60 hover:text-white"
                    aria-label={`Remove teammate ${member.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Option A: Google-like searchable dropdown */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full">
                <Combobox value={selectedTeammateUser} onChange={setSelectedTeammateUser} nullable>
                  <div className="relative">
                    <Combobox.Input
                      className="h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm font-sans text-white/90 outline-none placeholder:text-white/60 focus:border-white/20 focus:ring-2 focus:ring-white/10"
                      placeholder="Add people by name or email"
                      displayValue={(u: AvailableUser) => u?.email ?? ""}
                      onChange={(e) => setTeammateQuery(e.target.value)}
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

                  <Combobox.Options className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-white/10 bg-[#020617] py-1 shadow-2xl backdrop-blur">
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
                disabled={!selectedTeammateUser}
              >
                Invite
              </Button>
            </div>

            {teamMessage && <p className="mt-2 text-xs text-[color:var(--accent)]">{teamMessage}</p>}
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
                dragActive ? "border-[color:var(--accent)] bg-white/5" : "border-white/20 bg-black/40"
              }`}
            >
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => setResume(event.target.files?.[0] ?? null)}
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
                        className="h-4 w-4 rounded-full border-white/50 bg-transparent text-white accent-[color:var(--accent)]"
                      />
                      {value === "yes" ? "Yes" : "No"}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" className="uppercase tracking-[0.4em]">
              Submit application
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraftAction}
              className="uppercase tracking-[0.4em]"
            >
              Save draft
            </Button>
          </div>

          {message && <p className="text-sm text-[color:var(--accent)]">{message}</p>}
        </form>
      </div>
    </main>
  );
}