"use client";

import { ErrorState } from "@/components/public/ErrorState";

export default function PlayerProfileError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Player Profile Unavailable"
      description="This player profile could not be generated from backend data."
      detail={error.message}
      onRetry={reset}
    />
  );
}
