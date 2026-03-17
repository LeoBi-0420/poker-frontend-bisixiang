"use client";

import { ErrorState } from "@/components/public/ErrorState";

export default function VenuesError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Venues Unavailable"
      description="The venue directory could not be loaded from the backend."
      detail={error.message}
      onRetry={reset}
    />
  );
}
