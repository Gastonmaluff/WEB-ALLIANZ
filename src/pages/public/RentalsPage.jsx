import { SectionHeading } from "../../components/common/SectionHeading";
import { PropertyCard } from "../../components/public/PropertyCard";
import { MOCK_PROPERTIES } from "../../mocks/properties";

export function RentalsPage() {
  const rentalProperties = MOCK_PROPERTIES.filter((property) => property.tipoOperacion === "alquiler");

  return (
    <section className="section-wrap pt-32">
      <div className="container space-y-10">
        <SectionHeading
          eyebrow="Alquileres"
          title="Propiedades en alquiler"
          description="Seleccion de residencias premium para alquiler, con foco en ubicacion, diseño y confort."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {rentalProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
