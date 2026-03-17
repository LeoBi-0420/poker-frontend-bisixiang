import { LoadingState } from "@/components/public/LoadingState";

export default function PlayersLoading() {
  return (
    <LoadingState
      title="Loading players..."
      description="Fetching player profiles and directory data."
    />
  );
}
