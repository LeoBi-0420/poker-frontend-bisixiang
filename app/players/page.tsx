import { PageHeader } from "@/components/public/PageHeader";
import { PlayersWorkspace } from "@/components/public/PlayersWorkspace";
import { EmptyState } from "@/components/public/EmptyState";
import { getPlayerProfiles } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayersPage() {
  const profiles = await getPlayerProfiles();

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Community"
        title="Players"
        description="A larger player directory on the left with advanced player details on the right."
      />

      {profiles.length === 0 ? (
        <section className="table-shell">
          <EmptyState
            title="No players yet"
            description="Add your first player from the backend or upcoming admin workflow."
          />
        </section>
      ) : (
        <PlayersWorkspace profiles={profiles} />
      )}
    </main>
  );
}
