import Link from "next/link";
import { DataTable } from "@/components/public/DataTable";
import { EmptyState } from "@/components/public/EmptyState";
import { PageHeader } from "@/components/public/PageHeader";
import { StatCard } from "@/components/public/StatCard";
import { getGames } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GamesPage() {
  const gamesResult = await Promise.allSettled([getGames()]);
  const games = gamesResult[0].status === "fulfilled" ? gamesResult[0].value : [];
  const hasFailure = gamesResult[0].status === "rejected";
  const completedGames = games.filter((game) => game.status === "completed").length;
  const scheduledGames = games.filter((game) => game.status === "scheduled").length;
  const averageBuyIn =
    games.length === 0
      ? 0
      : games.reduce((sum, game) => sum + (game.buy_in ?? 0), 0) / games.length;

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Schedule"
        title="Games"
        description="Recent poker tournaments with status, timing, and venue context."
      />

      {hasFailure && (
        <div className="error-box" style={{ marginTop: "1rem" }}>
          Game data is temporarily unavailable. The page is still up, but the backend request failed.
        </div>
      )}

      <section className="card-grid">
        <StatCard label="Total Games" value={games.length} hint="All tracked tournaments" />
        <StatCard label="Completed" value={completedGames} hint="Finished games" />
        <StatCard label="Scheduled" value={scheduledGames} hint="Upcoming or pending games" />
        <StatCard label="Average Buy-in" value={formatCurrency(averageBuyIn)} hint="Across listed games" />
      </section>

      <DataTable
        columns={[
          {
            key: "game",
            label: "Game",
            className: "table-col-primary",
            render: (game) => (
              <div>
                <p className="table-title">{game.game_title || `Game ${game.game_id}`}</p>
                <p className="muted">{game.venue_name}</p>
              </div>
            ),
          },
          {
            key: "buy-in",
            label: "Buy-in",
            render: (game) => <p>{formatCurrency(game.buy_in)}</p>,
          },
          {
            key: "time",
            label: "Start Time",
            render: (game) => <p>{formatDateTime(game.start_time)}</p>,
          },
          {
            key: "status",
            label: "Status",
            render: (game) => (
              <div className="table-actions">
                <span className="pill">{game.status}</span>
                <Link href={`/games/${game.game_id}`} className="table-link">
                  Open details
                </Link>
              </div>
            ),
          },
        ]}
        rows={games}
        empty={
          <EmptyState
            title="No games yet"
            description={
              hasFailure
                ? "Game data could not be loaded from the backend right now."
                : "Create your first tournament from the backend or the upcoming admin flow."
            }
          />
        }
      />
    </main>
  );
}
