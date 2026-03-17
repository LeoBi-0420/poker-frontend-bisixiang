"use client";

import { ErrorState } from "@/components/public/ErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorState detail={error.message} onRetry={reset} />;
}
