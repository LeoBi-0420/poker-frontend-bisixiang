interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = "Loading...",
  description = "Fetching live tournament data from the API.",
}: LoadingStateProps) {
  return (
    <main className="page-wrap">
      <div className="state-shell">
        <div className="loading-orb" aria-hidden="true" />
        <h2 className="page-heading">{title}</h2>
        <p className="page-subheading">{description}</p>
      </div>
      <section className="card-grid">
        <article className="card skeleton-card" />
        <article className="card skeleton-card" />
        <article className="card skeleton-card" />
      </section>
    </main>
  );
}
