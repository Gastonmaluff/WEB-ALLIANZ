export function MetricCard({ title, value, hint, accent = "navy", icon }) {
  const accentClass = accent === "ink" ? "bg-ink" : accent === "slate" ? "bg-[#3C6179]" : "bg-[#163649]";

  return (
    <article className="overflow-hidden border-fine bg-paper shadow-[0_14px_28px_-24px_rgba(7,26,45,0.5)]">
      <div className={`h-[3px] w-full ${accentClass}`} />
      <div className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-editorial text-slate">{title}</p>
            <p className="mt-2 font-display text-3xl leading-none text-ink sm:text-4xl">{value}</p>
          </div>
          {icon ? <span className="text-lg text-slate/70">{icon}</span> : null}
        </div>
        {hint ? <p className="mt-2.5 text-[11px] text-slate">{hint}</p> : null}
      </div>
    </article>
  );
}
