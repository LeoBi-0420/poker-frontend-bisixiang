import { PageHeader } from "@/components/public/PageHeader";
import { StatCard } from "@/components/public/StatCard";
import { DataTable } from "@/components/public/DataTable";
import { EmptyState } from "@/components/public/EmptyState";
import { getPlayers } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayersPage() {
  const players = await getPlayers();
  const avatarCount = players.filter((player) => Boolean(player.avatar_url)).length;
  const newestPlayer = players[0]?.display_name ?? "No players yet";

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Community"
        title="Players"
        description="Public player directory for the Atlanta freeroll poker community."
      />

      <section className="card-grid">
        <StatCard label="Total Players" value={players.length} hint="Profiles currently tracked" />
        <StatCard label="Avatar Profiles" value={avatarCount} hint="Profiles with uploaded images" />
        <StatCard label="Newest Player" value={newestPlayer} hint="Most recently created profile" />
      </section>

      <DataTable
        columns={[
          {
            key: "player",
            label: "Player",
            className: "table-col-primary",
            render: (player) => (
              <div>
                <p className="table-title">{player.display_name}</p>
                <p className="muted">Player #{player.player_id}</p>
              </div>
            ),
          },
          {
            key: "avatar",
            label: "Avatar",
            render: (player) => (
              <p className="muted">{player.avatar_url ? "Configured" : "Not added"}</p>
            ),
          },
          {
            key: "created",
            label: "Joined",
            render: (player) => <p>{formatDateTime(player.created_at)}</p>,
          },
        ]}
        rows={players}
        empty={
          <EmptyState
            title="No players yet"
            description="Add your first player from the backend or upcoming admin workflow."
          />
        }
      />
    </main>
  );
}
