"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="page-wrap">
      <h2 className="page-heading">Request Failed</h2>
      <p className="page-subheading">
        Could not load data from backend. Check FastAPI status and API base URL.
      </p>
      <div className="error-box">{error.message}</div>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          marginTop: "0.9rem",
          border: "1px solid var(--line)",
          borderRadius: "999px",
          padding: "0.5rem 0.9rem",
          background: "var(--surface)",
        }}
      >
        Try again
      </button>
    </main>
  );
}
