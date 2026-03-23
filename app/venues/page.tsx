import { DataTable } from "@/components/public/DataTable";
import { EmptyState } from "@/components/public/EmptyState";
import { PageHeader } from "@/components/public/PageHeader";
import { StatCard } from "@/components/public/StatCard";
import { getVenues } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VenuesPage() {
  const venuesResult = await Promise.allSettled([getVenues()]);
  const venues = venuesResult[0].status === "fulfilled" ? venuesResult[0].value : [];
  const hasFailure = venuesResult[0].status === "rejected";
  const cityCount = new Set(venues.map((venue) => venue.city)).size;
  const addressCount = venues.filter((venue) => Boolean(venue.address)).length;

  return (
    <main className="page-wrap">
      <PageHeader
        eyebrow="Locations"
        title="Venues"
        description="Public directory of Atlanta-area venues that host tracked poker games."
      />

      {hasFailure && (
        <div className="error-box" style={{ marginTop: "1rem" }}>
          Venue data is temporarily unavailable. The page is still up, but the backend request failed.
        </div>
      )}

      <section className="card-grid">
        <StatCard label="Total Venues" value={venues.length} hint="Tracked hosting locations" />
        <StatCard label="Cities Covered" value={cityCount} hint="Unique city count" />
        <StatCard label="Addresses on File" value={addressCount} hint="Locations with street details" />
      </section>

      <DataTable
        columns={[
          {
            key: "venue",
            label: "Venue",
            className: "table-col-primary",
            render: (venue) => (
              <div>
                <p className="table-title">{venue.venue_name}</p>
                <p className="muted">Venue #{venue.venue_id}</p>
              </div>
            ),
          },
          {
            key: "address",
            label: "Address",
            render: (venue) => (
              <p className="muted">{venue.address || "Address not added yet"}</p>
            ),
          },
          {
            key: "location",
            label: "Location",
            render: (venue) => <p>{[venue.city, venue.state].filter(Boolean).join(", ")}</p>,
          },
        ]}
        rows={venues}
        empty={
          <EmptyState
            title="No venues yet"
            description={
              hasFailure
                ? "Venue data could not be loaded from the backend right now."
                : "Add your first venue from the backend or upcoming admin workflow."
            }
          />
        }
      />
    </main>
  );
}
