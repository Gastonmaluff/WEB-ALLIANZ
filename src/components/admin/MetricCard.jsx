export function MetricCard({ title, value, hint }) {
  return (
    <article className="admin-card">
      <p className="text-xs uppercase tracking-editorial text-slate">{title}</p>
      <p className="mt-3 font-display text-5xl leading-none text-ink">{value}</p>
      {hint ? <p className="mt-3 text-xs text-slate">{hint}</p> : null}
    </article>
  );
}
