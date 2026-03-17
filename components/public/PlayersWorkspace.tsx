"use client";

import Link from "next/link";
import { useState } from "react";
import type { PlayerProfile } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { DataTable } from "./DataTable";
import { EmptyState } from "./EmptyState";
import { PageHeader } from "./PageHeader";
import { StatCard } from "./StatCard";

interface PlayersWorkspaceProps {
  profiles: PlayerProfile[];
}

export function PlayersWorkspace({ profiles }: PlayersWorkspaceProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(
    profiles[0]?.player.player_id ?? null,
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredProfiles = profiles.filter((profile) =>
    profile.player.display_name.toLowerCase().includes(normalizedSearch),
  );

  const selectedProfile =
    filteredProfiles.find((profile) => profile.player.player_id === selectedId) ??
    filteredProfiles[0] ??
    null;

  return (
    <section className="players-layout players-layout-expanded">
      <aside className="player-directory card">
        <div className="player-directory-header">
          <div className="player-directory-topline">
            <h3 className="section-heading">Player Directory</h3>
            <div className="directory-total">
              <span className="muted">Total Players</span>
              <strong>{profiles.length}</strong>
            </div>
          </div>
          <p className="page-subheading">
            Search by any character and switch players without leaving this page.
          </p>
          <label className="directory-search">
            <span className="sr-only">Search players</span>
            <input
              type="text"
              placeholder="Search for player..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <div className="player-list">
          {filteredProfiles.length === 0 ? (
            <div className="player-list-empty">
              <p className="empty-state-title">No matching players</p>
              <p className="muted">Try another name fragment or clear the search.</p>
            </div>
          ) : (
            filteredProfiles.map((profile) => {
              const isSelected = profile.player.player_id === selectedProfile?.player.player_id;
              return (
                <button
                  key={profile.player.player_id}
                  type="button"
                  onClick={() => setSelectedId(profile.player.player_id)}
                  className={`player-list-item player-list-button${isSelected ? " is-selected" : ""}`}
                >
                  <div>
                    <p className="table-title">{profile.player.display_name}</p>
                    <p className="muted">Player #{profile.player.player_id}</p>
                  </div>
                  <div className="player-list-metrics">
                    <p>{profile.total_points} pts</p>
                    <p className="muted">{profile.games_played} games</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className="player-profile-panel">
        {selectedProfile ? (
          <>
            <PageHeader
              eyebrow="Player Profile"
              title={selectedProfile.player.display_name}
              description="Advanced player stats directly inside the Players page."
              action={
                <Link href={`/players/${selectedProfile.player.player_id}`} className="pill pill-ghost">
                  Open full page
                </Link>
              }
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
        ) : (
          <section className="table-shell">
            <EmptyState
              title="Select a player"
              description="Choose a player from the directory to inspect profile details."
            />
          </section>
        )}
      </div>
    </section>
  );
}
