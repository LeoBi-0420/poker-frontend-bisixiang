import { LoadingState } from "@/components/public/LoadingState";

export default function VenuesLoading() {
  return (
    <LoadingState
      title="Loading venues..."
      description="Fetching current venue directory data."
    />
  );
}
