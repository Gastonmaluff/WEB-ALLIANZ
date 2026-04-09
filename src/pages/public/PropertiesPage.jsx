import { SectionHeading } from "../../components/common/SectionHeading";
import { PropertyCard } from "../../components/public/PropertyCard";
import { MOCK_PROPERTIES } from "../../mocks/properties";

export function PropertiesPage() {
  return (
    <section className="section-wrap pt-32">
      <div className="container space-y-10">
        <SectionHeading
          eyebrow="Catalogo"
          title="Todas las propiedades"
          description="Explora la seleccion completa de inmuebles en venta y alquiler."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {MOCK_PROPERTIES.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
