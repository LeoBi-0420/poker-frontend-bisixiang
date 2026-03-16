import type {
  Game,
  GameDetail,
  LeaderboardRow,
  Player,
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
      first_places: number;
      total_kos: number;
    }
  >();

  for (const game of resultsByGame) {
    for (const row of game.results) {
      const current = bucket.get(row.player) ?? {
        total_points: 0,
        tournaments_played: 0,
        first_places: 0,
        total_kos: 0,
      };

      current.total_points += pointsForRank(row.finish_rank);
      current.tournaments_played += 1;
      current.first_places += row.finish_rank === 1 ? 1 : 0;
      current.total_kos += row.kos;

      bucket.set(row.player, current);
    }
  }

  const sorted = [...bucket.entries()]
    .map(([player, stats]) => ({ player, ...stats }))
    .sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      if (b.first_places !== a.first_places) return b.first_places - a.first_places;
      return b.total_kos - a.total_kos;
    });

  return sorted.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));
}
