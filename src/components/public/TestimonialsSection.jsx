import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "../common/SectionHeading";

function shuffleOnce(items) {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[randomIndex]] = [cloned[randomIndex], cloned[i]];
  }
  return cloned;
}

export function TestimonialsSection({ testimonials }) {
  const orderedTestimonials = useMemo(() => shuffleOnce(testimonials), [testimonials]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (orderedTestimonials.length < 2) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % orderedTestimonials.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [orderedTestimonials.length]);

  return (
    <section className="section-wrap bg-paper">
      <div className="container space-y-10">
        <SectionHeading
          eyebrow="Clientes"
          title="Testimonios"
          description="Compradores e inversionistas que eligieron Allianz para concretar operaciones de alto valor."
        />

        <div className="relative h-[270px] border-fine bg-surface md:h-[240px]">
          {orderedTestimonials.map((item, index) => (
            <article
              key={item.id}
              className={`absolute inset-0 flex flex-col justify-center p-8 transition-opacity duration-700 ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="mx-auto mb-6 max-w-3xl text-center text-base leading-relaxed text-slate md:text-lg">
                "{item.mensaje}"
              </p>
              <p className="text-center font-display text-3xl text-ink">{item.nombre}</p>
              <p className="text-center text-xs uppercase tracking-editorial text-slate">{item.rol}</p>
            </article>
          ))}
          <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
            {orderedTestimonials.map((item, index) => (
              <button
                key={`${item.id}-dot`}
                type="button"
                aria-label={`Ver testimonio ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-6 bg-ink" : "w-2 bg-ink/25 hover:bg-ink/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
