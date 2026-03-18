import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, adminPasswordConfigured, isAdminSessionValue } from "@/lib/admin-auth";
import { getGameResults, getGames, getPlayers, getVenues } from "@/lib/api";
import { PageHeader } from "@/components/public/PageHeader";
import { StatCard } from "@/components/public/StatCard";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AdminGameShell } from "./AdminGameShell";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pick(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function AdminPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const authEnabled = adminPasswordConfigured();
  if (authEnabled && !isAdminSessionValue(session)) redirect("/admin/login");

  const params = await searchParams;
  const [venues, players, games] = await Promise.all([getVenues(), getPlayers(), getGames()]);
  const resultsByGame = await Promise.all(
    games.map(async (game) => ({
      game,
      results: await getGameResults(game.game_id),
    })),
  );
  const adminResults = resultsByGame.flatMap(({ game, results }) =>
    results.map((result) => ({
      ...result,
      game_id: game.game_id,
      game_title: game.game_title || `Game ${game.game_id}`,
    })),
  );
  const error = pick(params.error);
  const message = pick(params.message);

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Admin Workspace"
        title="Admin Console"
        description="Create players, venues, games, and results from one lightweight control panel."
        action={
          authEnabled ? (
            <form method="POST" action="/admin/logout">
              <button type="submit" className="btn">
                Sign out
              </button>
            </form>
          ) : null
        }
      />

      {!authEnabled && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            Auth is currently disabled for this deployment. Set `ADMIN_PASSWORD` in Vercel when you want to protect the admin routes.
          </p>
        </div>
      )}

      <section className="card-grid" style={{ marginTop: "1rem" }}>
        <StatCard label="Players" value={players.length} hint="Profiles available for result entry" />
        <StatCard label="Venues" value={venues.length} hint="Locations available for new games" />
        <StatCard label="Games" value={games.length} hint="Tournaments currently tracked" />
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h3 className="section-heading">Game + Results Workflow</h3>
          <p className="page-subheading">Fastest path for entering a full tournament and its results in one pass.</p>
        </div>
        <AdminGameShell initialVenues={venues} initialPlayers={players} />
      </section>

      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <section className="card-grid" style={{ marginTop: "1rem" }}>
        <article className="card">
          <h3 className="section-heading">Add Venue</h3>
          <p className="page-subheading">Create a new poker venue before scheduling games there.</p>
          <form method="POST" action="/admin/venues" className="form-stack">
            <div className="form-field">
              <label htmlFor="venue_name">
                Venue name <span className="required-indicator">*</span>
              </label>
              <input id="venue_name" name="venue_name" required />
            </div>
            <div className="form-field">
              <label htmlFor="address">
                Address <span className="optional-label">(optional)</span>
              </label>
              <input id="address" name="address" />
            </div>
            <div className="form-field">
              <label htmlFor="city">
                City <span className="required-indicator">*</span>
              </label>
              <input id="city" name="city" defaultValue="Atlanta" required />
            </div>
            <div className="form-field">
              <label htmlFor="state">
                State <span className="required-indicator">*</span>
              </label>
              <input id="state" name="state" defaultValue="GA" required />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Venue
            </button>
          </form>
        </article>

        <article className="card">
          <h3 className="section-heading">Add Player</h3>
          <p className="page-subheading">Add a player profile to make them available in results entry.</p>
          <form method="POST" action="/admin/players" className="form-stack">
            <div className="form-field">
              <label htmlFor="display_name">
                Display name <span className="required-indicator">*</span>
              </label>
              <input id="display_name" name="display_name" required />
            </div>
            <div className="form-field">
              <label htmlFor="avatar_url">
                Avatar URL <span className="optional-label">(optional)</span>
              </label>
              <input id="avatar_url" name="avatar_url" type="url" placeholder="https://..." />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Player
            </button>
          </form>
        </article>

        <article className="card">
          <h3 className="section-heading">Add Game</h3>
          <p className="page-subheading">Use the simpler form when you only need to create a tournament record.</p>
          <form method="POST" action="/admin/games" className="form-stack">
            <div className="form-field">
              <label htmlFor="game_title">
                Game title <span className="required-indicator">*</span>
              </label>
              <input id="game_title" name="game_title" required />
            </div>
            <div className="form-field">
              <label htmlFor="start_time">
                Start time <span className="required-indicator">*</span>
              </label>
              <input id="start_time" name="start_time" type="datetime-local" required />
            </div>
            <div className="form-field">
              <label htmlFor="venue_id">
                Venue <span className="required-indicator">*</span>
              </label>
              <select id="venue_id" name="venue_id" required>
                <option value="">Select venue</option>
                {venues.map((venue) => (
                  <option key={venue.venue_id} value={venue.venue_id}>
                    #{venue.venue_id} - {venue.venue_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="buy_in">
                Buy-in (USD) <span className="optional-label">(optional)</span>
              </label>
              <input id="buy_in" name="buy_in" type="number" min="0" step="0.01" placeholder="0" />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Game
            </button>
          </form>
        </article>

        <article className="card">
          <h3 className="section-heading">Add Results</h3>
          <p className="page-subheading">Quick single-result entry for corrections and follow-up updates.</p>
          <form method="POST" action="/admin/results" className="form-stack">
            <div className="form-field">
              <label htmlFor="game_id">
                Game <span className="required-indicator">*</span>
              </label>
              <select id="game_id" name="game_id" required>
                <option value="">Select game</option>
                {games.map((game) => (
                  <option key={game.game_id} value={game.game_id}>
                    #{game.game_id} - {game.game_title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="player_id">
                Player <span className="required-indicator">*</span>
              </label>
              <select id="player_id" name="player_id" required>
                <option value="">Select player</option>
                {players.map((player) => (
                  <option key={player.player_id} value={player.player_id}>
                    #{player.player_id} - {player.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="finish_rank">
                Finish rank <span className="required-indicator">*</span>
              </label>
              <input id="finish_rank" name="finish_rank" type="number" min="1" required />
            </div>
            <div className="form-field">
              <label htmlFor="points">
                Points <span className="required-indicator">*</span>
              </label>
              <input id="points" name="points" type="number" required />
            </div>
            <div className="form-field">
              <label htmlFor="kos">
                KOs <span className="required-indicator">*</span>
              </label>
              <input id="kos" name="kos" type="number" min="0" defaultValue="0" required />
            </div>
            <div className="form-field">
              <label htmlFor="eliminated_by_player_id">Eliminated by (optional)</label>
              <select id="eliminated_by_player_id" name="eliminated_by_player_id">
                <option value="">None</option>
                {players.map((player) => (
                  <option key={player.player_id} value={player.player_id}>
                    #{player.player_id} - {player.display_name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Save Result
            </button>
          </form>
        </article>
      </section>

      <section className="page-section">
        <div className="section-heading-row">
          <h3 className="section-heading">Manage Existing Data</h3>
          <span className="muted">Delete results first, then games. Players and venues are protected when linked data exists.</span>
        </div>

        <div className="card-grid admin-manage-grid">
          <article className="card admin-manage-card">
            <h4 className="section-heading">Delete Results</h4>
            <p className="page-subheading">Safest first step when cleaning up incorrect tournament entries.</p>
            <div className="admin-manage-list">
              {adminResults.length === 0 ? (
                <p className="muted">No results recorded yet.</p>
              ) : (
                adminResults.map((result) => (
                  <form key={`${result.game_id}-${result.player_id}-${result.finish_rank}`} method="POST" action="/admin/delete-results" className="admin-manage-item">
                    <div>
                      <p className="table-title">{result.player}</p>
                      <p className="muted">
                        {result.game_title} · Rank #{result.finish_rank} · {result.points} pts
                      </p>
                    </div>
                    <input type="hidden" name="game_id" value={result.game_id} />
                    <input type="hidden" name="player_id" value={result.player_id ?? ""} />
                    <ConfirmDeleteButton
                      message={`Delete ${result.player}'s result from ${result.game_title}? This cannot be undone.`}
                    />
                  </form>
                ))
              )}
            </div>
          </article>

          <article className="card admin-manage-card">
            <h4 className="section-heading">Delete Games</h4>
            <p className="page-subheading">Deleting a game also deletes its attached results.</p>
            <div className="admin-manage-list">
              {games.length === 0 ? (
                <p className="muted">No games to manage.</p>
              ) : (
                games.map((game) => (
                  <form key={game.game_id} method="POST" action="/admin/delete-games" className="admin-manage-item">
                    <div>
                      <p className="table-title">{game.game_title || `Game ${game.game_id}`}</p>
                      <p className="muted">{game.venue_name}</p>
                    </div>
                    <input type="hidden" name="game_id" value={game.game_id} />
                    <input type="hidden" name="game_title" value={game.game_title || `Game ${game.game_id}`} />
                    <ConfirmDeleteButton
                      message={`Delete ${game.game_title || `Game ${game.game_id}`}? This will also delete all attached results.`}
                    />
                  </form>
                ))
              )}
            </div>
          </article>

          <article className="card admin-manage-card">
            <h4 className="section-heading">Delete Players</h4>
            <p className="page-subheading">Only players with no linked results can be deleted.</p>
            <div className="admin-manage-list">
              {players.length === 0 ? (
                <p className="muted">No players to manage.</p>
              ) : (
                players.map((player) => (
                  <form key={player.player_id} method="POST" action="/admin/delete-players" className="admin-manage-item">
                    <div>
                      <p className="table-title">{player.display_name}</p>
                      <p className="muted">Player #{player.player_id}</p>
                    </div>
                    <input type="hidden" name="player_id" value={player.player_id} />
                    <input type="hidden" name="display_name" value={player.display_name} />
                    <ConfirmDeleteButton
                      message={`Delete player ${player.display_name}? This only works when no results are linked to this player.`}
                    />
                  </form>
                ))
              )}
            </div>
          </article>

          <article className="card admin-manage-card">
            <h4 className="section-heading">Delete Venues</h4>
            <p className="page-subheading">Only venues with no linked games can be deleted.</p>
            <div className="admin-manage-list">
              {venues.length === 0 ? (
                <p className="muted">No venues to manage.</p>
              ) : (
                venues.map((venue) => (
                  <form key={venue.venue_id} method="POST" action="/admin/delete-venues" className="admin-manage-item">
                    <div>
                      <p className="table-title">{venue.venue_name}</p>
                      <p className="muted">
                        {[venue.city, venue.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <input type="hidden" name="venue_id" value={venue.venue_id} />
                    <input type="hidden" name="venue_name" value={venue.venue_name} />
                    <ConfirmDeleteButton
                      message={`Delete venue ${venue.venue_name}? This only works when no games are linked to this venue.`}
                    />
                  </form>
                ))
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
