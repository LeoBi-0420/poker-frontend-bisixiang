import { notFound } from "next/navigation";
import { getGame } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  const gameId = Number(id);
  if (Number.isNaN(gameId)) notFound();

  let game;
  try {
    game = await getGame(gameId);
  } catch {
    notFound();
  }

  return (
    <main className="page-wrap">
      <section>
        <h2 className="page-heading">{game.game_title || `Game ${game.game_id}`}</h2>
        <p className="page-subheading">{game.venue.venue_name}</p>
        <div style={{ marginTop: "0.65rem", display: "flex", gap: "0.55rem", alignItems: "center" }}>
          <span className="pill">{game.status}</span>
          <span className="muted">{formatDateTime(game.start_time)}</span>
        </div>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <h3 style={{ fontWeight: 700 }}>Final Results</h3>
        <div className="table-list">
          {game.results.length === 0 && (
            <div className="table-row">
              <p className="muted">No results posted for this game.</p>
            </div>
          )}
          {game.results.map((row) => (
            <article key={`${row.player}-${row.finish_rank}`} className="table-row">
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span className="rank-badge">#{row.finish_rank}</span>
                <div>
                  <p style={{ fontWeight: 660 }}>{row.player}</p>
                  <p className="muted">
                    Eliminated by: {row.eliminated_by ?? "N/A"}
                  </p>
                </div>
              </div>
              <p>{row.points} pts</p>
              <p>{row.kos} KOs</p>
              <p className="muted">Rank {row.finish_rank}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
