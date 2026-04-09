import { AppButton } from "../common/AppButton";
import { ROUTES } from "../../router/paths";

export function HeroSection() {
  return (
    <section className="section-wrap pt-32">
      <div className="container">
        <div className="relative grid overflow-hidden border-fine bg-paper lg:grid-cols-12">
          <div className="relative z-10 bg-hero-fade p-10 lg:col-span-5 lg:p-14">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-editorial text-slate">
              Portfolio 2026
            </p>
            <h1 className="mb-5 text-5xl leading-[0.95] text-ink md:text-7xl">
              Arquitectura de lujo para vivir e invertir.
            </h1>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-slate md:text-base">
              Seleccion premium de propiedades en venta y alquiler con enfoque editorial y
              asesoramiento integral.
            </p>
            <AppButton to={ROUTES.properties}>Ver propiedades</AppButton>
          </div>

          <div className="lg:col-span-7">
            <img
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=80"
              alt="Casa moderna de lujo"
              className="h-[520px] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
