import { SectionHeading } from "../common/SectionHeading";

export function TestimonialsSection({ testimonials }) {
  return (
    <section className="section-wrap bg-paper">
      <div className="container space-y-10">
        <SectionHeading
          eyebrow="Clientes"
          title="Testimonios"
          description="Compradores e inversionistas que eligieron Allianz para concretar operaciones de alto valor."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.id} className="border-fine bg-surface p-6">
              <p className="mb-5 text-sm leading-relaxed text-slate">"{item.mensaje}"</p>
              <p className="font-display text-2xl text-ink">{item.nombre}</p>
              <p className="text-xs uppercase tracking-editorial text-slate">{item.rol}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
