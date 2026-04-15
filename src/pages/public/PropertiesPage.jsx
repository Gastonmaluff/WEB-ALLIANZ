import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SectionHeading } from "../../components/common/SectionHeading";
import { PropertyCard } from "../../components/public/PropertyCard";
import { getProperties } from "../../content/propertiesContent";

function isRentOperation(value) {
  return value === "alquiler" || value === "venta_o_alquiler";
}

export function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get("tipo");
  const operationFilter = searchParams.get("operacion");
  const properties = useMemo(() => getProperties(), []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (typeFilter === "lote" && property.tipoPropiedad !== "Lote") return false;
      if (operationFilter === "alquiler" && !isRentOperation(property.tipoOperacion)) return false;
      if (operationFilter === "venta" && !["venta", "venta_o_alquiler"].includes(property.tipoOperacion)) {
        return false;
      }
      return true;
    });
  }, [operationFilter, properties, typeFilter]);

  const heading = useMemo(() => {
    if (typeFilter === "lote") {
      return {
        eyebrow: "Catalogo",
        title: "Lotes",
        description: "Terrenos y oportunidades de desarrollo disponibles para inversion.",
      };
    }

    if (operationFilter === "alquiler") {
      return {
        eyebrow: "Catalogo",
        title: "Propiedades en alquiler",
        description: "Unidades listas para alquiler con enfoque premium.",
      };
    }

    return {
      eyebrow: "Catalogo",
      title: "Todas las propiedades",
      description: "Explora la seleccion completa de inmuebles en venta y alquiler.",
    };
  }, [operationFilter, typeFilter]);

  return (
    <section className="section-wrap pt-32">
      <div className="container space-y-10">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          description={heading.description}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
