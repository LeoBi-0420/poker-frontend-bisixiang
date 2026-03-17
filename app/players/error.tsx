"use client";

import { ErrorState } from "@/components/public/ErrorState";

export default function PlayersError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Player Directory Unavailable"
      description="The player directory could not be loaded from the backend."
      detail={error.message}
      onRetry={reset}
    />
  );
}
