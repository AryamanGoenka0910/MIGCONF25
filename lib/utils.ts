import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "@supabase/supabase-js";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const nonEmpty = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
};

export function getUserDisplayName(user: User | null | undefined, fallback = "Unnamed applicant") {
  const md = (user?.user_metadata ?? {}) as Record<string, unknown>;

  return (
    nonEmpty(md.full_name) ??
    nonEmpty([md.first_name, md.last_name].map(nonEmpty).filter(Boolean).join(" ")) ??
    user?.email ??
    fallback
  );
}

export function getUserEmail(user: User | null | undefined, fallback = "Unnamed applicant") {
  return (
    nonEmpty(user?.email) ??
    fallback
  );
}