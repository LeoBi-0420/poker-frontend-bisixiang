export interface Player {
  player_id: number;
  display_name: string;
  avatar_url: string | null;
  created_at: string | null;
}

export interface PlayerProfileGame {
  game_id: number;
  game_title: string;
  start_time: string | null;
  venue_name: string;
  finish_rank: number;
  points: number;
  kos: number;
  eliminated_by: string | null;
}

export interface PlayerProfile {
  player: Player;
  total_points: number;
  games_played: number;
  wins: number;
  top_three_finishes: number;
  average_finish: number;
  total_kos: number;
  recent_results: PlayerProfileGame[];
}

export interface Venue {
  venue_id: number;
  venue_name: string;
  address: string | null;
  city: string;
  state: string;
  created_at: string | null;
}

export interface Game {
  game_id: number;
  game_title: string;
  start_time: string | null;
  status: string;
  buy_in: number | null;
  venue_name: string;
}

export interface Result {
  finish_rank: number;
  player_id?: number;
  player: string;
  points: number;
  kos: number;
  eliminated_by: string | null;
}

export interface GameDetail {
  game_id: number;
  game_title: string;
  start_time: string | null;
  status: string;
  buy_in: number | null;
  venue: {
    venue_id: number;
    venue_name: string;
  };
  results: Result[];
}

export interface LeaderboardRow {
  rank: number;
  player: string;
  total_points: number;
  tournaments_played: number;
  wins: number;
  top_three_finishes: number;
  average_finish: number;
  total_kos: number;
}
