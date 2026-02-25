import type { AvailableUser } from "@/lib/types";

type FetchAllUsersParams = {
  token: string | null | undefined;
  currentUserId?: string;
  setUsers: (users: AvailableUser[]) => void;
  setLoading: (loading: boolean) => void;
  signal?: AbortSignal;
  includeTeamed?: string;
};

export async function fetchAllUsers({
  token,
  currentUserId,
  setUsers,
  setLoading,
  signal,
  includeTeamed,
}: FetchAllUsersParams) {

  setLoading(true);

  if (!token) {
    setLoading(false);
    return;
  }

  try {
    const res = await fetch("/api/user-directory?includeTeamed=" + (includeTeamed ?? "false"), {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });

    if (!res.ok) {
      setLoading(false);
      return;
    }

    const json = (await res.json()) as { users?: AvailableUser[] };
    const allUsers = Array.isArray(json.users) ? json.users : [];
    setUsers(currentUserId ? allUsers.filter((u) => u.id !== currentUserId) : allUsers);
  } catch (err) {
    // ignore cancellation errors
    if ((err as DOMException).name === "AbortError") return;
    setLoading(false);
  } finally {
    setLoading(false);
  }
}
