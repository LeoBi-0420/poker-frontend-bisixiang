import { LoadingState } from "@/components/public/LoadingState";

export default function GameDetailLoading() {
  return (
    <LoadingState
      title="Loading game details..."
      description="Fetching the latest tournament standings and metadata."
    />
  );
}
