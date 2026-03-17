import { LoadingState } from "@/components/public/LoadingState";

export default function GamesLoading() {
  return (
    <LoadingState
      title="Loading games..."
      description="Fetching the latest tournament list from the API."
    />
  );
}
