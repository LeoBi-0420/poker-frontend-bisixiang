import { getLeaderboard } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RankingsPage() {
  const leaderboard = await getLeaderboard();

  return (
    <main className="page-wrap">
      <section>
        <h2 className="page-heading">Player Rankings</h2>
        <p className="page-subheading">
          Point rule: 1st=10, 2nd=8, 3rd=7, 4th=5, 5th=4, 6th=3, 7th=2, 8th=1.
        </p>
      </section>

      <section className="table-list">
        {leaderboard.length === 0 && (
          <div className="table-row">
            <p className="muted">No ranking data yet.</p>
          </div>
        )}
        {leaderboard.map((row) => (
          <article key={row.player} className="table-row">
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span className="rank-badge">#{row.rank}</span>
              <div>
                <p style={{ fontWeight: 680 }}>{row.player}</p>
                <p className="muted">
                  {row.tournaments_played} games, {row.first_places} wins
                </p>
              </div>
            </div>
            <p style={{ fontWeight: 690 }}>{row.total_points} pts</p>
            <p>{row.total_kos} KOs</p>
            <p className="muted">Top {row.rank}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
