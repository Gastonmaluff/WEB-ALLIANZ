import { AppButton } from "../common/AppButton";
import { ROUTES } from "../../router/paths";

export function PremiumZoneSection() {
  const blueprintSrc = `${import.meta.env.BASE_URL}parana-country-club-blueprint.png`;

  return (
    <section className="section-wrap-compact">
      <div className="container">
        <div className="overflow-hidden border-fine bg-paper">
          <div className="grid gap-8 p-7 sm:p-9 md:gap-10 md:p-11 lg:grid-cols-12 lg:items-center lg:p-12">
            <div className="lg:col-span-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-editorial text-slate">
                Zona premium
              </p>
              <h2 className="mb-4 text-4xl leading-none text-ink md:text-5xl">Parana Country Club</h2>
              <p className="mb-7 max-w-md text-sm leading-relaxed text-slate md:text-base">
                Presencia consolidada en una de las zonas mas exclusivas del pais.
              </p>
              <AppButton to={ROUTES.properties}>Ver propiedades</AppButton>
            </div>

            <div className="relative lg:col-span-7">
              <div className="relative overflow-hidden border-fine bg-navy/95">
                <img
                  src={blueprintSrc}
                  alt="Mapa blueprint de la zona Parana Country Club"
                  className="h-[230px] w-full object-cover object-right opacity-[0.13] md:h-[300px] lg:h-[360px]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-paper/90 via-paper/55 to-paper/15 lg:from-transparent lg:via-transparent lg:to-navy/35" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(9,25,44,0.1)_0%,rgba(9,25,44,0.02)_40%,rgba(9,25,44,0.16)_100%)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

