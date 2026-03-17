"use client";

import { ErrorState } from "@/components/public/ErrorState";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GameDetailError({ error, reset }: Props) {
  return (
    <ErrorState
      title="Could not load game details"
      description="The tournament summary request failed. Check the backend and try again."
      detail={error.message}
      onRetry={reset}
    />
  );
}
