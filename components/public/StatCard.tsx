interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <article className="card stat-card">
      <p className="muted">{label}</p>
      <p className="stat-value">{value}</p>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </article>
  );
}
