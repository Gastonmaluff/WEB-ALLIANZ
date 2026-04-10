export function MetricCard({ title, value, hint, accent = "navy", icon }) {
  const accentClass = accent === "ink" ? "bg-ink" : accent === "slate" ? "bg-[#3C6179]" : "bg-[#163649]";

  return (
    <article className="overflow-hidden border-fine bg-paper">
      <div className={`h-1 w-full ${accentClass}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-editorial text-slate">{title}</p>
            <p className="mt-3 font-display text-5xl leading-none text-ink">{value}</p>
          </div>
          {icon ? <span className="text-2xl text-slate/70">{icon}</span> : null}
        </div>
        {hint ? <p className="mt-5 text-xs text-slate">{hint}</p> : null}
      </div>
    </article>
  );
}
