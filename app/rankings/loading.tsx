import { LoadingState } from "@/components/public/LoadingState";

export default function RankingsLoading() {
  return (
    <LoadingState
      title="Loading rankings..."
      description="Aggregating leaderboard metrics from recorded game results."
    />
  );
}
