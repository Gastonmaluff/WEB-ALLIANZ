import { AppButton } from "../common/AppButton";
import { ROUTES } from "../../router/paths";

export function PremiumZoneSection() {
  const blueprintSrc = `${import.meta.env.BASE_URL}parana-country-club-blueprint.png`;
  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-allianz-mark.png`;

  return (
    <section className="section-wrap-compact">
      <div className="container">
        <div className="relative overflow-hidden border border-[#17344A] bg-[#071A2D]">
          <img
            src={blueprintSrc}
            alt="Mapa blueprint de la zona Parana Country Club"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[66%_50%]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,rgba(7,26,45,0.98)_0%,rgba(7,26,45,0.96)_38%,rgba(7,26,45,0.86)_62%,rgba(7,26,45,0.8)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_0%,rgba(86,128,164,0.24)_0%,rgba(7,26,45,0.04)_60%,rgba(7,26,45,0.1)_100%)]" />

          <img
            src={logoMarkSrc}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 right-[-54px] hidden w-[390px] select-none opacity-25 mix-blend-screen md:block lg:w-[470px]"
          />

          <div className="relative z-10 px-7 py-10 sm:px-9 sm:py-11 md:px-12 md:py-14 lg:max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-editorial text-[#9AB6CC]">
              Zona premium
            </p>
            <h2 className="mb-5 text-4xl leading-none text-paper md:text-5xl">Paraná Country Club</h2>
            <p className="mb-8 max-w-xl text-sm leading-relaxed text-[#BFD0DE] md:text-base">
              Presencia consolidada en una de las zonas más exclusivas del país.
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
