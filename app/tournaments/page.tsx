import Link from "next/link";
import { getGames } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TournamentsPage() {
  const games = await getGames();

  return (
    <main className="page-wrap">
      <section>
        <h2 className="page-heading">Tournaments</h2>
        <p className="page-subheading">Tournament list with direct detail access.</p>
      </section>

      <section className="table-list">
        {games.length === 0 && (
          <div className="table-row">
            <p className="muted">No tournaments found.</p>
          </div>
        )}
        {games.map((game) => (
          <article key={game.game_id} className="table-row">
            <div>
              <p style={{ fontWeight: 680 }}>{game.game_title || `Tournament ${game.game_id}`}</p>
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
          </article>
        ))}
      </section>
    </main>
  );
}
