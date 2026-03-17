"use client";

import { ErrorState } from "@/components/public/ErrorState";

export default function GamesError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Games Unavailable"
      description="The tournament list could not be loaded from the backend."
      detail={error.message}
      onRetry={reset}
    />
  );
}
