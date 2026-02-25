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


export type { DirectoryUser, AvailableUser, Application, User, InviteUserRow, Invite };