import Link from "next/link";
import { getGames, getPlayers, getVenues } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [games, players, venues] = await Promise.all([
    getGames(),
    getPlayers(),
    getVenues(),
  ]);

  const recentGames = games.slice(0, 5);

  return (
    <main className="page-wrap">
      <section>
        <h2 className="page-heading">Dashboard</h2>
        <p className="page-subheading">
          Mobile-first overview of your tournament system.
        </p>
      </section>

      <section className="card-grid">
        <article className="card">
          <p className="muted">Total Players</p>
          <p className="stat-value">{players.length}</p>
        </article>
        <article className="card">
          <p className="muted">Total Venues</p>
          <p className="stat-value">{venues.length}</p>
        </article>
        <article className="card">
          <p className="muted">Total Games</p>
          <p className="stat-value">{games.length}</p>
        </article>
        <article className="card">
          <p className="muted">Last Sync</p>
          <p className="stat-value" style={{ fontSize: "1rem" }}>
            Live API
          </p>
        </article>
      </section>

      <section style={{ marginTop: "1.1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontWeight: 700 }}>Recent Tournaments</h3>
          <Link href="/tournaments" className="pill">
            View all
          </Link>
        </div>
        <div className="table-list">
          {recentGames.length === 0 && (
            <div className="table-row">
              <p className="muted">No games yet. Add a tournament from FastAPI.</p>
            </div>
          )}
          {recentGames.map((game) => (
            <div key={game.game_id} className="table-row">
              <div>
                <p style={{ fontWeight: 650 }}>{game.game_title || `Tournament ${game.game_id}`}</p>
                <p className="muted">{game.venue_name}</p>
              </div>
              <p>{formatDateTime(game.start_time)}</p>
              <p>
                <span className="pill">{game.status}</span>
              </p>
              <p>
                <Link href={`/tournaments/${game.game_id}`} style={{ color: "var(--accent)" }}>
                  Open details
                </Link>
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
