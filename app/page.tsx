import Link from "next/link";
import { EmptyState } from "@/components/public/EmptyState";
import { getGames, getPlayers, getVenues } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const [gamesResult, playersResult, venuesResult] = await Promise.allSettled([
    getGames(),
    getPlayers(),
    getVenues(),
  ]);

  const games = gamesResult.status === "fulfilled" ? gamesResult.value : [];
  const players = playersResult.status === "fulfilled" ? playersResult.value : [];
  const venues = venuesResult.status === "fulfilled" ? venuesResult.value : [];
  const hasPartialFailure =
    gamesResult.status === "rejected" ||
    playersResult.status === "rejected" ||
    venuesResult.status === "rejected";

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

      {hasPartialFailure && (
        <div className="error-box" style={{ marginTop: "1rem" }}>
          Some live dashboard data could not be loaded right now. The site is still up, but one or more backend requests timed out.
        </div>
      )}

      <section style={{ marginTop: "1.1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontWeight: 700 }}>Recent Tournaments</h3>
          <Link href="/tournaments" className="pill">
            View all
          </Link>
        </div>
        {recentGames.length === 0 ? (
          <section className="table-shell">
            <EmptyState
              title="No recent tournaments available"
              description={
                hasPartialFailure
                  ? "Tournament data is temporarily unavailable from the backend."
                  : "No games yet. Add a tournament from the admin workspace."
              }
            />
          </section>
        ) : (
          <div className="table-list">
            {recentGames.map((game) => (
              <div key={game.game_id} className="table-row">
                <div>
                  <p style={{ fontWeight: 650 }}>{game.game_title || `Tournament ${game.game_id}`}</p>
                  <p className="muted">{game.venue_name}</p>
                  <p className="muted" style={{ fontSize: "0.8rem" }}>Buy-in: {formatCurrency(game.buy_in)}</p>
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
        )}
      </section>
    </main>
  );
}
