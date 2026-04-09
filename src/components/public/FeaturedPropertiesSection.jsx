import { SectionHeading } from "../common/SectionHeading";
import { PropertyCard } from "./PropertyCard";

export function FeaturedPropertiesSection({ properties }) {
  return (
    <section className="section-wrap">
      <div className="container space-y-10">
        <SectionHeading
          eyebrow="Seleccion destacada"
          title="Propiedades de portada"
          description="Residencias y departamentos de alto nivel con excelente ubicacion y calidad constructiva."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
