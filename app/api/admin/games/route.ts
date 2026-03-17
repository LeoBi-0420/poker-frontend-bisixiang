import { NextResponse } from "next/server";
import { postBackend } from "@/lib/backend-admin";

interface Body {
  game?: {
    game_title?: string;
    start_time?: string;
    venue_id?: number;
    buy_in?: number;
  };
  results?: Array<{
    finish_rank?: number;
    player_id?: number;
    points?: number;
    kos?: number;
    eliminated_by_player_id?: number | null;
  }>;
}

export async function POST(request: Request) {
  let payload: Body;
  try {
    payload = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { game, results } = payload ?? {};
  if (!game) {
    return NextResponse.json({ error: "Missing game payload" }, { status: 400 });
  }

  const { game_title, start_time, venue_id, buy_in = 0 } = game;
  if (!game_title?.trim()) {
    return NextResponse.json({ error: "game_title is required" }, { status: 400 });
  }
  if (!start_time) {
    return NextResponse.json({ error: "start_time is required" }, { status: 400 });
  }
  if (!venue_id) {
    return NextResponse.json({ error: "venue_id is required" }, { status: 400 });
  }
  if (Number.isNaN(buy_in) || buy_in < 0) {
    return NextResponse.json({ error: "buy_in must be non-negative" }, { status: 400 });
  }

  const createRes = await postBackend("/games", {
    game_title: game_title.trim(),
    start_time,
    venue_id,
    buy_in,
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    return NextResponse.json({ error: `Create game failed (${createRes.status}): ${text}` }, { status: 502 });
  }

  const createdGame = await createRes.json();

  const cleanResults = (Array.isArray(results) ? results : [])
    .filter((row) => row.finish_rank && row.player_id)
    .map((row) => ({
      finish_rank: Number(row.finish_rank),
      player_id: Number(row.player_id),
      points: Number(row.points ?? 0),
      kos: Number(row.kos ?? 0),
      eliminated_by_player_id: row.eliminated_by_player_id ?? null,
    }));

  if (cleanResults.length) {
    const resultsRes = await postBackend(`/games/${createdGame.game_id}/results`, cleanResults);
    if (!resultsRes.ok) {
      const text = await resultsRes.text();
      return NextResponse.json({ error: `Results upload failed (${resultsRes.status}): ${text}` }, { status: 502 });
    }
  }

  return NextResponse.json({ game: createdGame });
}
