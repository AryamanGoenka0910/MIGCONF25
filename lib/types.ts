type DirectoryUser = { id: string; email: string; full_name: string | null };
type AvailableUser = { id: string; email: string; full_name: string | null; avatar_url?: string | null };
export type { DirectoryUser, AvailableUser };