import type { AdminApplication, AdminTeammate } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type StatusValue = AdminApplication["status"] | AdminTeammate["status"];

export const statusBadgeVariant = (
  status: StatusValue | "checked_in" | null | undefined
): "outline" | "default" | "destructive" | "secondary" | "success" => {
  if (status === "app_accepted") return "default";
  if (status === "app_rejected") return "destructive";
  if (status === "app_submitted") return "outline";
  if (status === "rsvp_confirmed") return "default";
  if (status === "checked_in") return "success";
  return "secondary";
};

export const statusLabel = (status: StatusValue | "checked_in" | null | undefined): string => {
  if (status === "app_submitted") return "Submitted";
  if (status === "app_accepted") return "Accepted";
  if (status === "app_rejected") return "Rejected";
  if (status === "rsvp_confirmed") return "RSVP Confirmed";
  if (status === "checked_in") return "Checked In";
  return "—";
};
