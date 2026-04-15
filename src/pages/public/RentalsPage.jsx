import { SectionHeading } from "../../components/common/SectionHeading";
import { PropertyCard } from "../../components/public/PropertyCard";
import { getProperties } from "../../content/propertiesContent";

function isRentOperation(value) {
  return value === "alquiler" || value === "venta_o_alquiler";
}

export function RentalsPage() {
  const rentalProperties = getProperties().filter((property) => isRentOperation(property.tipoOperacion));

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
