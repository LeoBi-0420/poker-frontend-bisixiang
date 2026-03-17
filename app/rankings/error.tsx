"use client";

import { ErrorState } from "@/components/public/ErrorState";

export default function RankingsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Rankings Unavailable"
      description="The leaderboard could not be generated from backend results data."
      detail={error.message}
      onRetry={reset}
    />
  );
}
