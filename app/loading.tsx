export default function Loading() {
  return (
    <main className="page-wrap">
      <h2 className="page-heading">Loading...</h2>
      <p className="page-subheading">Fetching live tournament data from API.</p>
      <section className="card-grid">
        <article className="card" style={{ height: "96px" }} />
        <article className="card" style={{ height: "96px" }} />
        <article className="card" style={{ height: "96px" }} />
        <article className="card" style={{ height: "96px" }} />
      </section>
    </main>
  );
}
