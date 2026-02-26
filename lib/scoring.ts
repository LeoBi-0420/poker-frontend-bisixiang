import type { Result } from "./types";

const POINTS_BY_RANK: Record<number, number> = {
  1: 10,
  2: 8,
  3: 7,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
};

export function pointsForRank(rank: number): number {
  return POINTS_BY_RANK[rank] ?? 0;
}

export function sumRankPoints(results: Result[]): number {
  return results.reduce((sum, row) => sum + pointsForRank(row.finish_rank), 0);
}
