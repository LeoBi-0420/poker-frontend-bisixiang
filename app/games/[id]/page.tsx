import Link from "next/link";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/public/DataTable";
import { EmptyState } from "@/components/public/EmptyState";
import { PageHeader } from "@/components/public/PageHeader";
import { StatCard } from "@/components/public/StatCard";
import { getGame } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const entrantCount = game.results.length;
  const winner = game.results.find((row) => row.finish_rank === 1)?.player ?? "Pending";
  const totalKos = game.results.reduce((sum, row) => sum + row.kos, 0);
  const podium = game.results
    .filter((row) => row.finish_rank <= 3)
    .sort((a, b) => a.finish_rank - b.finish_rank);

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Game Detail"
        title={game.game_title || `Game ${game.game_id}`}
        description={`Tournament snapshot for ${game.venue.venue_name}.`}
        action={
          <Link href="/games" className="btn">
            Back to games
          </Link>
        }
      />

      <section className="card-grid">
        <StatCard label="Venue" value={game.venue.venue_name} hint={formatDateTime(game.start_time)} />
        <StatCard label="Status" value={game.status} hint={`Buy-in ${formatCurrency(game.buy_in)}`} />
        <StatCard label="Entrants" value={entrantCount} hint={`${totalKos} total KOs recorded`} />
        <StatCard label="Winner" value={winner} hint={entrantCount === 0 ? "Results pending" : "Current first-place finisher"} />
      </section>

      <section className="page-section">
        <div className="section-heading-row">
          <h3 className="section-heading">Podium</h3>
          <span className="muted">Top finishers for this game</span>
        </div>
        {podium.length === 0 ? (
          <section className="table-shell">
            <EmptyState
              title="No final results yet"
              description="Post tournament results from the admin workspace to populate this game summary."
            />
          </section>
        ) : (
          <div className="card-grid game-podium-grid">
            {podium.map((row) => (
              <article key={`${row.player}-${row.finish_rank}`} className="card game-podium-card">
                <span className="rank-badge">#{row.finish_rank}</span>
                <div>
                  <p className="table-title">{row.player}</p>
                  <p className="muted">
                    {row.points} pts · {row.kos} KOs
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="page-section">
        <div className="section-heading-row">
          <h3 className="section-heading">Full Results</h3>
          <span className="muted">Finish rank, points, knockouts, and bust-out context</span>
        </div>
        <DataTable
          columns={[
            {
              key: "player",
              label: "Player",
              className: "table-col-primary",
              render: (row) => (
                <div>
                  <p className="table-title">{row.player}</p>
                  <p className="muted">{row.eliminated_by ? `Eliminated by ${row.eliminated_by}` : "Winner / still standing"}</p>
                </div>
              ),
            },
            {
              key: "finish",
              label: "Finish",
              render: (row) => <p>#{row.finish_rank}</p>,
            },
            {
              key: "points",
              label: "Points",
              render: (row) => <p>{row.points}</p>,
            },
            {
              key: "kos",
              label: "KOs",
              render: (row) => <p>{row.kos}</p>,
            },
          ]}
          rows={game.results}
          empty={
            <EmptyState
              title="No results submitted"
              description="This tournament exists, but the admin workflow has not posted final standings yet."
            />
          }
        />
      </section>
    </main>
  );
}
