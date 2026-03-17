import Link from "next/link";
import { PageHeader } from "@/components/public/PageHeader";
import { StatCard } from "@/components/public/StatCard";
import { DataTable } from "@/components/public/DataTable";
import { EmptyState } from "@/components/public/EmptyState";
import { getPlayerProfile, getPlayers } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  searchParams?: Promise<{ playerId?: string }>;
}

export default async function PlayersPage({ searchParams }: Props) {
  const players = await getPlayers();
  const params = searchParams ? await searchParams : {};
  const avatarCount = players.filter((player) => Boolean(player.avatar_url)).length;
  const newestPlayer = players[0]?.display_name ?? "No players yet";
  const selectedPlayerId =
    Number(params.playerId) || players[0]?.player_id;
  const selectedProfile =
    selectedPlayerId ? await getPlayerProfile(selectedPlayerId) : null;

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Community"
        title="Players"
        description="Player directory with a built-in profile view so you can inspect advanced stats immediately."
      />

      <section className="card-grid">
        <StatCard label="Total Players" value={players.length} hint="Profiles currently tracked" />
        <StatCard label="Avatar Profiles" value={avatarCount} hint="Profiles with uploaded images" />
        <StatCard label="Newest Player" value={newestPlayer} hint="Most recently created profile" />
      </section>

      {players.length === 0 ? (
        <section className="table-shell">
          <EmptyState
            title="No players yet"
            description="Add your first player from the backend or upcoming admin workflow."
          />
        </section>
      ) : (
        <section className="players-layout">
          <aside className="player-directory card">
            <div className="player-directory-header">
              <h3 className="section-heading">Player Directory</h3>
              <p className="page-subheading">Choose a player to refresh the profile pane.</p>
            </div>
            <div className="player-list">
              {players.map((player) => {
                const isSelected = player.player_id === selectedPlayerId;
                return (
                  <Link
                    key={player.player_id}
                    href={`/players?playerId=${player.player_id}`}
                    className={`player-list-item${isSelected ? " is-selected" : ""}`}
                  >
                    <div>
                      <p className="table-title">{player.display_name}</p>
                      <p className="muted">Player #{player.player_id}</p>
                    </div>
                    <p className="muted">
                      {player.avatar_url ? "Avatar ready" : "No avatar"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </aside>

          <div className="player-profile-panel">
            {selectedProfile ? (
              <>
                <PageHeader
                  eyebrow="Player Profile"
                  title={selectedProfile.player.display_name}
                  description="Advanced player stats without leaving the players page."
                />

                <section className="card-grid">
                  <StatCard label="Total Points" value={selectedProfile.total_points} hint="Current MVP ranking points" />
                  <StatCard label="Games Played" value={selectedProfile.games_played} hint="Recorded tournament finishes" />
                  <StatCard label="Wins" value={selectedProfile.wins} hint={`${selectedProfile.top_three_finishes} top-3 finishes`} />
                  <StatCard label="Average Finish" value={selectedProfile.average_finish.toFixed(2)} hint={`${selectedProfile.total_kos} total KOs`} />
                </section>

                <section style={{ marginTop: "1rem" }}>
                  <PageHeader
                    title="Recent Results"
                    description={`Latest finish history for ${selectedProfile.player.display_name}.`}
                    action={
                      <Link href={`/players/${selectedProfile.player.player_id}`} className="pill pill-ghost">
                        Open full page
                      </Link>
                    }
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
                    rows={selectedProfile.recent_results}
                    empty={
                      <EmptyState
                        title="No results yet"
                        description="This player exists, but no tournament results have been recorded yet."
                      />
                    }
                  />
                </section>
              </>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
