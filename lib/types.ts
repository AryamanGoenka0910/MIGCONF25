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

export type { DirectoryUser, AvailableUser, Application, User };