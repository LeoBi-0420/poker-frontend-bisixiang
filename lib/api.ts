import type {
  Game,
  GameDetail,
  LeaderboardRow,
  Player,
  Result,
  Venue,
} from "./types";
import { pointsForRank } from "./scoring";

const SERVER_API_BASE =
  process.env.BACKEND_API_URL ?? "http://127.0.0.1:8001";
const CLIENT_API_BASE = "/api";

async function fetchJSON<T>(path: string): Promise<T> {
  const base =
    typeof window === "undefined" ? SERVER_API_BASE : CLIENT_API_BASE;

  const res = await fetch(`${base}${path}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} on ${path}`);
  }

  return res.json();
}

export function getPlayers(): Promise<Player[]> {
  return fetchJSON<Player[]>("/players");
}

export function getVenues(): Promise<Venue[]> {
  return fetchJSON<Venue[]>("/venues");
}

export function getGames(): Promise<Game[]> {
  return fetchJSON<Game[]>("/games");
}

export function getGame(id: number | string): Promise<GameDetail> {
  return fetchJSON<GameDetail>(`/games/${id}`);
}

export function getGameResults(id: number | string): Promise<Result[]> {
  return fetchJSON<Result[]>(`/games/${id}/results`);
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
