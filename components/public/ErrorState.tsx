"use client";

interface ErrorStateProps {
  title?: string;
  description?: string;
  detail?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Request Failed",
  description = "Could not load data from backend. Check FastAPI status and API base URL.",
  detail,
  onRetry,
}: ErrorStateProps) {
  return (
    <main className="page-wrap">
      <div className="state-shell state-shell-error">
        <h2 className="page-heading">{title}</h2>
        <p className="page-subheading">{description}</p>
        {detail ? <div className="error-box">{detail}</div> : null}
        {onRetry ? (
          <button type="button" onClick={onRetry} className="btn">
            Try again
          </button>
        ) : null}
      </div>
    </main>
  );
}
