import Link from "next/link";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/public/DataTable";
import { EmptyState } from "@/components/public/EmptyState";
import { PageHeader } from "@/components/public/PageHeader";
import { StatCard } from "@/components/public/StatCard";
import { ApiError, getPlayerProfile } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayerProfilePage({ params }: Props) {
  const { id } = await params;

  let profile;
  try {
    profile = await getPlayerProfile(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Player Profile"
        title={profile.player.display_name}
        description="Player-level performance snapshot built from recorded tournament results."
        action={
          <Link href="/players" className="pill pill-ghost">
            Back to players
          </Link>
        }
      />

      <section className="card-grid">
        <StatCard label="Total Points" value={profile.total_points} hint="Current MVP ranking points" />
        <StatCard label="Games Played" value={profile.games_played} hint="Recorded tournament finishes" />
        <StatCard label="Wins" value={profile.wins} hint={`${profile.top_three_finishes} top-3 finishes`} />
        <StatCard label="Average Finish" value={profile.average_finish.toFixed(2)} hint={`${profile.total_kos} total KOs`} />
      </section>

      <section style={{ marginTop: "1rem" }}>
        <PageHeader
          title="Recent Results"
          description="Most recent tournaments and finish history for this player."
        />

        <DataTable
          columns={[
            {
              key: "game",
              label: "Game",
              className: "table-col-primary",
              render: (row) => (
                <div>
                  <Link href={`/games/${row.game_id}`} className="table-link table-title">
                    {row.game_title}
                  </Link>
                  <p className="muted">{row.venue_name}</p>
                </div>
              ),
            },
            {
              key: "finish",
              label: "Finish",
              render: (row) => (
                <div>
                  <p>#{row.finish_rank}</p>
                  <p className="muted">{row.points} pts</p>
                </div>
              ),
            },
            {
              key: "kos",
              label: "KOs",
              render: (row) => (
                <div>
                  <p>{row.kos}</p>
                  <p className="muted">Eliminated by {row.eliminated_by ?? "N/A"}</p>
                </div>
              ),
            },
            {
              key: "date",
              label: "Date",
              render: (row) => <p>{formatDateTime(row.start_time)}</p>,
            },
          ]}
          rows={profile.recent_results}
          empty={
            <EmptyState
              title="No results yet"
              description="This player exists, but no tournament results have been recorded yet."
            />
          }
        />
      </section>
    </main>
  );
}
