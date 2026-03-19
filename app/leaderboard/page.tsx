"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import BackgroundGlow from "@/components/background-glow";

type AccessState = "loading" | "denied" | "granted";

type Team = {
  team_id: number;
  team_name: string;
  game_1_score: number | null;
  game_2_score: number | null;
  game_3_score: number | null;
  game_4_score: number | null;
  algo_score: number | null;
};

type RankedTeam = Team & { total: number | null; rank: number | null };

function computeTotal(t: Team): number | null {
  const scores = [t.game_1_score, t.game_2_score, t.game_3_score, t.game_4_score, t.algo_score];
  const nonNull = scores.filter((s): s is number => s !== null);
  return nonNull.length === 0 ? null : nonNull.reduce((a, b) => a + b, 0);
}

function computeRanked(teams: Team[]): RankedTeam[] {
  const withTotal = teams
    .map((t) => ({ ...t, total: computeTotal(t), rank: null as number | null }))
    .filter((t) => t.total !== null)
    .sort((a, b) => (a.total as number) - (b.total as number));

  const noTotal = teams
    .filter((t) => computeTotal(t) === null)
    .map((t) => ({ ...t, total: null, rank: null as number | null }));

  let rank = 1;
  for (let i = 0; i < withTotal.length; i++) {
    if (i > 0 && withTotal[i].total !== withTotal[i - 1].total) {
      rank = i + 1;
    }
    withTotal[i].rank = rank;
  }

  return [...withTotal, ...noTotal];
}

function RankCell({ rank }: { rank: number | null }) {
  if (rank === null) return <span className="text-white/20">—</span>;
  if (rank === 1)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-bold">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/70 text-sm font-bold">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/15 text-orange-400/80 text-sm font-bold">
        3
      </span>
    );
  return <span className="text-white/40 text-sm font-medium">{rank}</span>;
}

function ScoreCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/20">—</span>;
  return <span>{value}</span>;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, loading, session } = useSession();

  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [teams, setTeams] = useState<Team[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !session) {
      router.replace("/signin");
      return;
    }
    async function checkAccess() {
      const res = await fetch("/api/user_routes/user", {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const data = (await res.json()) as { role?: string; status?: string | null };
      const allowed =
        data.role === "Admin" ||
        data.role === "Sponsor" ||
        data.status === "checked_in";
      if (allowed) {
        setAccessState("granted");
      } else {
        setAccessState("denied");
        router.replace("/dashboard");
      }
    }
    checkAccess();
  }, [user, loading, session, router]);

  const fetchLeaderboard = useCallback(async () => {
    if (!session) return;
    setDataLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to load leaderboard.");
        return;
      }
      setTeams((await res.json()) as Team[]);
    } catch {
      setError("Failed to load leaderboard.");
    } finally {
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (accessState === "granted" && !hasFetched.current) {
      hasFetched.current = true;
      fetchLeaderboard();
    }
  }, [accessState, fetchLeaderboard]);

  if (accessState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundGlow />
        <p className="text-white/60 text-sm">Checking access…</p>
      </div>
    );
  }

  if (accessState === "denied") return null;

  const ranked = computeRanked(teams);
  const scored = ranked.filter((t) => t.rank !== null);
  const unscored = ranked.filter((t) => t.rank === null);

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <BackgroundGlow />

      <div className="relative z-10 max-w-5xl mx-auto mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-white/40 text-sm mt-1">
            Ranked by lowest combined score (Games 1–4 + Algo)
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-300">
            {error}
            <button
              className="ml-3 underline opacity-70 hover:opacity-100"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {dataLoading ? (
          <div className="text-white/50 text-sm py-16 text-center">
            Loading leaderboard…
          </div>
        ) : teams.length === 0 ? (
          <div className="text-white/50 text-sm py-16 text-center">
            No teams found.
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left w-14">Rank</th>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-right">G1</th>
                  <th className="px-4 py-3 text-right">G2</th>
                  <th className="px-4 py-3 text-right">G3</th>
                  <th className="px-4 py-3 text-right">G4</th>
                  <th className="px-4 py-3 text-right">Algo</th>
                  <th className="px-4 py-3 text-right font-semibold text-white/50">Total</th>
                </tr>
              </thead>
              <tbody>
                {scored.map((team, i) => (
                  <tr
                    key={team.team_id}
                    className={[
                      "border-b border-white/5 hover:bg-white/5 transition-colors font-mono",
                      i === scored.length - 1 && unscored.length === 0 ? "border-b-0" : "",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3">
                      <RankCell rank={team.rank} />
                    </td>
                    <td className="px-4 py-3 font-sans font-medium text-white whitespace-nowrap">
                      {team.team_name}
                    </td>
                    <td className="px-4 py-3 text-right text-white/70">
                      <ScoreCell value={team.game_1_score} />
                    </td>
                    <td className="px-4 py-3 text-right text-white/70">
                      <ScoreCell value={team.game_2_score} />
                    </td>
                    <td className="px-4 py-3 text-right text-white/70">
                      <ScoreCell value={team.game_3_score} />
                    </td>
                    <td className="px-4 py-3 text-right text-white/70">
                      <ScoreCell value={team.game_4_score} />
                    </td>
                    <td className="px-4 py-3 text-right text-white/50">
                      <ScoreCell value={team.algo_score} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {team.total}
                    </td>
                  </tr>
                ))}

                {unscored.length > 0 && (
                  <>
                    {scored.length > 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-1.5 text-[10px] text-white/20 uppercase tracking-widest border-t border-white/5"
                        >
                          No scores submitted
                        </td>
                      </tr>
                    )}
                    {unscored.map((team, i) => (
                      <tr
                        key={team.team_id}
                        className={[
                          "border-b border-white/5 hover:bg-white/3 transition-colors font-mono",
                          i === unscored.length - 1 ? "border-b-0" : "",
                        ].join(" ")}
                      >
                        <td className="px-4 py-3 text-white/20">—</td>
                        <td className="px-4 py-3 font-sans text-white/40 whitespace-nowrap">
                          {team.team_name}
                        </td>
                        <td className="px-4 py-3 text-right text-white/20">—</td>
                        <td className="px-4 py-3 text-right text-white/20">—</td>
                        <td className="px-4 py-3 text-right text-white/20">—</td>
                        <td className="px-4 py-3 text-right text-white/20">—</td>
                        <td className="px-4 py-3 text-right text-white/20">—</td>
                        <td className="px-4 py-3 text-right text-white/20">—</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>

            <div className="px-4 py-2.5 border-t border-white/5 text-right">
              <span className="text-xs text-white/20">
                {scored.length} ranked · {teams.length} total teams
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
