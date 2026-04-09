export function SectionHeading({ eyebrow, title, description, className = "" }) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-editorial text-slate">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mb-4 text-4xl font-semibold leading-none text-ink md:text-5xl">{title}</h2>
      {description ? <p className="text-sm leading-relaxed text-slate md:text-base">{description}</p> : null}
    </div>
  );
}
