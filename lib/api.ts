import type {
  Game,
  GameDetail,
  LeaderboardRow,
  Player,
  PlayerProfile,
  PlayerProfileGame,
  Result,
  Venue,
} from "./types";
import { pointsForRank } from "./scoring";
import { ENV } from "./env";

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    public readonly body: string,
  ) {
    super(`API ${status} – ${url}`);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

export async function apiFetch<T>(
  path: string,
  timeoutMs = 10_000,
): Promise<T> {
  const base = typeof window === "undefined" ? ENV.apiServer : ENV.apiPublic;
  const url = `${base}${path}`;

  console.log(`[api] GET ${url}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout =
      err instanceof Error && err.name === "AbortError";
    throw new ApiError(0, url, isTimeout ? `Timed out after ${timeoutMs}ms` : msg);
  }
  clearTimeout(timer);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, url, body);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public helpers (API unchanged from the outside)
// ---------------------------------------------------------------------------

export function getPlayers(): Promise<Player[]> {
  return apiFetch<Player[]>("/players");
}

export function getVenues(): Promise<Venue[]> {
  return apiFetch<Venue[]>("/venues");
}

export function getGames(): Promise<Game[]> {
  return apiFetch<Game[]>("/games");
}

export function getGame(id: number | string): Promise<GameDetail> {
  return apiFetch<GameDetail>(`/games/${id}`);
}

export function getGameResults(id: number | string): Promise<Result[]> {
  return apiFetch<Result[]>(`/games/${id}/results`);
}

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const games = await getGames();
  const resultsByGame = await Promise.all(
    games.map(async (game) => ({
      gameId: game.game_id,
      results: await getGameResults(game.game_id),
    })),
  );

  const bucket = new Map<
    string,
    {
      total_points: number;
      tournaments_played: number;
      wins: number;
      top_three_finishes: number;
      finish_total: number;
      total_kos: number;
    }
  >();

  for (const game of resultsByGame) {
    for (const row of game.results) {
      const current = bucket.get(row.player) ?? {
        total_points: 0,
        tournaments_played: 0,
        wins: 0,
        top_three_finishes: 0,
        finish_total: 0,
        total_kos: 0,
      };

      current.total_points += pointsForRank(row.finish_rank);
      current.tournaments_played += 1;
      current.wins += row.finish_rank === 1 ? 1 : 0;
      current.top_three_finishes += row.finish_rank <= 3 ? 1 : 0;
      current.finish_total += row.finish_rank;
      current.total_kos += row.kos;

      bucket.set(row.player, current);
    }
  }

  const sorted = [...bucket.entries()]
    .map(([player, stats]) => ({
      player,
      total_points: stats.total_points,
      tournaments_played: stats.tournaments_played,
      wins: stats.wins,
      top_three_finishes: stats.top_three_finishes,
      average_finish:
        stats.tournaments_played === 0
          ? 0
          : Number((stats.finish_total / stats.tournaments_played).toFixed(2)),
      total_kos: stats.total_kos,
    }))
    .sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.average_finish !== b.average_finish) return a.average_finish - b.average_finish;
      return b.total_kos - a.total_kos;
    });

  return sorted.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));
}

function buildPlayerProfile(
  player: Player,
  resultsByGame: Array<{ game: Game; results: Result[] }>,
): PlayerProfile {
  const recentResults: PlayerProfileGame[] = resultsByGame
    .flatMap(({ game, results }) =>
      results
        .filter((row) => row.player === player.display_name)
        .map((row) => ({
          game_id: game.game_id,
          game_title: game.game_title || `Game ${game.game_id}`,
          start_time: game.start_time,
          venue_name: game.venue_name,
          finish_rank: row.finish_rank,
          points: pointsForRank(row.finish_rank),
          kos: row.kos,
          eliminated_by: row.eliminated_by,
        })),
    )
    .sort((a, b) => {
      const timeA = a.start_time ? new Date(a.start_time).getTime() : 0;
      const timeB = b.start_time ? new Date(b.start_time).getTime() : 0;
      return timeB - timeA;
    });

  const gamesPlayed = recentResults.length;
  const wins = recentResults.filter((row) => row.finish_rank === 1).length;
  const topThreeFinishes = recentResults.filter((row) => row.finish_rank <= 3).length;
  const totalPoints = recentResults.reduce((sum, row) => sum + row.points, 0);
  const totalKos = recentResults.reduce((sum, row) => sum + row.kos, 0);
  const averageFinish =
    gamesPlayed === 0
      ? 0
      : Number(
          (
            recentResults.reduce((sum, row) => sum + row.finish_rank, 0) / gamesPlayed
          ).toFixed(2),
        );

  return {
    player,
    total_points: totalPoints,
    games_played: gamesPlayed,
    wins,
    top_three_finishes: topThreeFinishes,
    average_finish: averageFinish,
    total_kos: totalKos,
    recent_results: recentResults,
  };
}

export async function getPlayerProfiles(): Promise<PlayerProfile[]> {
  const [players, games] = await Promise.all([getPlayers(), getGames()]);
  const resultsByGame = await Promise.all(
    games.map(async (game) => ({
      game,
      results: await getGameResults(game.game_id),
    })),
  );

  return players.map((player) => buildPlayerProfile(player, resultsByGame));
}

export async function getPlayerProfile(id: number | string): Promise<PlayerProfile> {
  const playerId = Number(id);
  if (Number.isNaN(playerId)) {
    throw new ApiError(400, String(id), "Invalid player id");
  }

  const profiles = await getPlayerProfiles();
  const profile = profiles.find((entry) => entry.player.player_id === playerId);
  if (!profile) {
    throw new ApiError(404, `/players/${playerId}`, "Player not found");
  }
  return profile;
}
