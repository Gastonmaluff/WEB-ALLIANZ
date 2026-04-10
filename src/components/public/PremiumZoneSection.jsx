import { AppButton } from "../common/AppButton";
import { ROUTES } from "../../router/paths";

export function PremiumZoneSection() {
  const blueprintSrc = `${import.meta.env.BASE_URL}parana-country-club-blueprint.png`;

  return (
    <section className="section-wrap-compact">
      <div className="container">
        <div className="relative overflow-hidden border border-[#17344A] bg-[#071A2D]">
          <img
            src={blueprintSrc}
            alt="Mapa blueprint de la zona Parana Country Club"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[66%_50%]"
          />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,rgba(7,26,45,0.62)_0%,rgba(7,26,45,0.42)_34%,rgba(7,26,45,0.2)_58%,rgba(7,26,45,0.06)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,26,45,0.12)_0%,rgba(7,26,45,0.02)_35%,rgba(7,26,45,0.08)_100%)]" />

          <div className="relative z-10 px-7 py-10 sm:px-9 sm:py-11 md:px-12 md:py-14 lg:max-w-2xl">
            <h2 className="mb-5 inline-block bg-[#071A2D]/62 px-2 py-1 text-4xl leading-none text-paper md:text-5xl">
              Parana Country Club
            </h2>
            <p className="mb-8 max-w-xl bg-[#071A2D]/50 px-2 py-1 text-sm leading-relaxed text-[#D4DFE8] md:text-base">
              Presencia consolidada en una de las zonas mas exclusivas del pais.
            </p>
            <AppButton
              to={ROUTES.properties}
              variant="light"
              className="!bg-paper/95 !text-ink hover:!bg-paper"
            >
              Ver propiedades
            </AppButton>
          </div>
        </div>
      </div>
    </section>
  );
}
