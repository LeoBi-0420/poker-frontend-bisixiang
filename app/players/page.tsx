import { PageHeader } from "@/components/public/PageHeader";
import { PlayersWorkspace } from "@/components/public/PlayersWorkspace";
import { EmptyState } from "@/components/public/EmptyState";
import { getPlayerProfiles } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayersPage() {
  const profilesResult = await Promise.allSettled([getPlayerProfiles()]);
  const profiles = profilesResult[0].status === "fulfilled" ? profilesResult[0].value : [];
  const hasFailure = profilesResult[0].status === "rejected";

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Community"
        title="Players"
        description="A larger player directory on the left with advanced player details on the right."
      />

      {hasFailure && (
        <div className="error-box" style={{ marginTop: "1rem" }}>
          Player data is temporarily unavailable. The page is still up, but the backend request failed.
        </div>
      )}

      {profiles.length === 0 ? (
        <section className="table-shell">
          <EmptyState
            title="No players yet"
            description={
              hasFailure
                ? "Player data could not be loaded from the backend right now."
                : "Add your first player from the backend or upcoming admin workflow."
            }
          />
        </section>
      ) : (
        <PlayersWorkspace profiles={profiles} />
      )}
    </main>
  );
}
