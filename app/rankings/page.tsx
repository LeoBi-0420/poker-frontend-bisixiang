import { DataTable } from "@/components/public/DataTable";
import { EmptyState } from "@/components/public/EmptyState";
import { PageHeader } from "@/components/public/PageHeader";
import { StatCard } from "@/components/public/StatCard";
import { getLeaderboard } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RankingsPage() {
  const leaderboardResult = await Promise.allSettled([getLeaderboard()]);
  const leaderboard =
    leaderboardResult[0].status === "fulfilled" ? leaderboardResult[0].value : [];
  const hasFailure = leaderboardResult[0].status === "rejected";
  const leader = leaderboard[0];
  const totalGamesTracked = leaderboard.reduce(
    (sum, row) => sum + row.tournaments_played,
    0,
  );

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Flagship Feature"
        title="Rankings"
        description="Simple points-based leaderboard built from recorded results data."
      />

      {hasFailure && (
        <div className="error-box" style={{ marginTop: "1rem" }}>
          Ranking data is temporarily unavailable. The page is still up, but one or more backend requests failed.
        </div>
      )}

      <section className="card-grid">
        <StatCard label="Ranked Players" value={leaderboard.length} hint="Players with recorded results" />
        <StatCard label="Games Counted" value={totalGamesTracked} hint="Total finishes included in rankings" />
        <StatCard
          label="Current Leader"
          value={leader ? leader.player : "TBD"}
          hint={leader ? `${leader.total_points} points` : "No results yet"}
        />
      </section>

      <DataTable
        columns={[
          {
            key: "player",
            label: "Player",
            className: "table-col-primary",
            render: (row) => (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span className="rank-badge">#{row.rank}</span>
                <div>
                  <p className="table-title">{row.player}</p>
                  <p className="muted">
                    {row.tournaments_played} games tracked
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "points",
            label: "Points",
            render: (row) => <p style={{ fontWeight: 700 }}>{row.total_points} pts</p>,
          },
          {
            key: "finishes",
            label: "Wins / Top 3",
            render: (row) => (
              <div>
                <p>{row.wins} wins</p>
                <p className="muted">{row.top_three_finishes} top-3 finishes</p>
              </div>
            ),
          },
          {
            key: "average",
            label: "Average Finish",
            render: (row) => (
              <div>
                <p>{row.average_finish.toFixed(2)}</p>
                <p className="muted">{row.total_kos} total KOs</p>
              </div>
            ),
          },
        ]}
        rows={leaderboard}
        empty={
          <EmptyState
            title="No ranking data yet"
            description={
              hasFailure
                ? "Ranking data could not be loaded from the backend right now."
                : "Add game results to start building the community leaderboard."
            }
          />
        }
      />
    </main>
  );
}
