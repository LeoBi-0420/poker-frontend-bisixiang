export interface Player {
  player_id: number;
  display_name: string;
  avatar_url: string | null;
  created_at: string | null;
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
  first_places: number;
  total_kos: number;
}
