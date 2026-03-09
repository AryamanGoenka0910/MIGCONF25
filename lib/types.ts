type DirectoryUser = { id: string; email: string; full_name: string | null };
type AvailableUser = { id: string; email: string; full_name: string | null; avatar_url?: string | null };

type Application = {
  school: string;
  major: string;
  grad_year: string;
  how_did_you_hear: string;
  teammates?: string[] | null;
  travel_reimbursement: boolean;
  trading_experience: boolean;
};

type User = {
  user_id: string;
  user_email: string;
  user_name: string;
  team_id: number | null;
  role: string;
  status: string | null;
};

type InviteUserRow = {
  user_id: string;
  user_email: string;
  user_name: string;
  team_id: number;
  role: string;
};

type Invite = {
  invite_id: string;
  from_user_id: string;
  to_user_id: string;
  team_id: number;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string | null;
  to_user?: InviteUserRow | null;
  from_user?: InviteUserRow | null;
};


type AdminTeammate = {
  user_id: string;
  user_name: string;
  user_email: string;
  status: "app_submitted" | "app_accepted" | "app_rejected" | null;
};

type AdminApplication = {
  application_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  school: string;
  major: string;
  grad_year: string;
  how_did_you_hear: string;
  travel_reimbursement: boolean;
  trading_experience: boolean;
  submitted_at: string | null;
  status: "app_submitted" | "app_accepted" | "app_rejected" | null;
  travel_budget: number;
  team_id: number | null;
  teammates: AdminTeammate[];
};

export type { DirectoryUser, AvailableUser, Application, User, InviteUserRow, Invite, AdminApplication, AdminTeammate };