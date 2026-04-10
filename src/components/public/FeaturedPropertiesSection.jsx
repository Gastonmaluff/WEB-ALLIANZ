import { SectionHeading } from "../common/SectionHeading";
import { PropertyCard } from "./PropertyCard";
import { AppButton } from "../common/AppButton";

export function FeaturedPropertiesSection({
  properties,
  eyebrow = "Seleccion destacada",
  title = "Propiedades de portada",
  description = "Residencias y departamentos de alto nivel con excelente ubicacion y calidad constructiva.",
  ctaTo,
  ctaLabel = "Ver mas",
  className = "",
}) {
  return (
    <section className={`section-wrap-compact ${className}`}>
      <div className="container space-y-8 md:space-y-9">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <div className="grid gap-6 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {ctaTo ? (
          <div className="pt-0.5 text-center">
            <AppButton to={ctaTo} variant="ghost">
              {ctaLabel}
            </AppButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
