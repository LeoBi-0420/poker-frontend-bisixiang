import { getVenues } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VenuesPage() {
  const venues = await getVenues();

  return (
    <main className="page-wrap">
      <section>
        <h2 className="page-heading">Venues</h2>
        <p className="page-subheading">Location directory for tournament hosting.</p>
      </section>

      <section className="table-list">
        {venues.length === 0 && (
          <div className="table-row">
            <p className="muted">No venues found.</p>
          </div>
        )}
        {venues.map((venue) => (
          <article key={venue.venue_id} className="table-row">
            <div>
              <p style={{ fontWeight: 680 }}>{venue.venue_name}</p>
              <p className="muted">
                {[venue.address, venue.city, venue.state].filter(Boolean).join(", ")}
              </p>
            </div>
            <p className="muted">Venue #{venue.venue_id}</p>
            <p />
            <p />
          </article>
        ))}
      </section>
    </main>
  );
}
