import { LoadingState } from "@/components/public/LoadingState";

export default function PlayerProfileLoading() {
  return (
    <LoadingState
      title="Loading player profile..."
      description="Fetching player results, stats, and recent tournament history."
    />
  );
}
