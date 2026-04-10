export function MetricCard({ title, value, hint, accent = "navy", icon }) {
  const accentClass = accent === "ink" ? "bg-ink" : accent === "slate" ? "bg-[#3C6179]" : "bg-[#163649]";

  return (
    <article className="overflow-hidden border-fine bg-paper">
      <div className={`h-1 w-full ${accentClass}`} />
      <div className="p-4 sm:p-5 md:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-editorial text-slate sm:text-xs">{title}</p>
            <p className="mt-2 font-display text-4xl leading-none text-ink sm:mt-3 sm:text-5xl">{value}</p>
          </div>
          {icon ? <span className="text-lg text-slate/70 sm:text-2xl">{icon}</span> : null}
        </div>
        {hint ? <p className="mt-3 text-[11px] text-slate sm:mt-5 sm:text-xs">{hint}</p> : null}
      </div>
    </article>
  );
}
