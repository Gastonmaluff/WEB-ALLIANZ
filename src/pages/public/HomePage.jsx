import { HeroSection } from "../../components/public/HeroSection";
import { FeaturedPropertiesSection } from "../../components/public/FeaturedPropertiesSection";
import { PremiumZoneSection } from "../../components/public/PremiumZoneSection";
import { TestimonialsSection } from "../../components/public/TestimonialsSection";
import { ContactSection } from "../../components/public/ContactSection";
import { getProperties } from "../../content/propertiesContent";
import { MOCK_TESTIMONIALS } from "../../mocks/testimonials";
import { ROUTES } from "../../router/paths";

function isRentOperation(value) {
  return value === "alquiler" || value === "venta_o_alquiler";
}

export function HomePage() {
  const properties = getProperties();
  const featuredProperties = properties.filter((item) => item.destacadaEnPortada).slice(0, 3);
  const lotsProperties = properties.filter((item) => item.tipoPropiedad === "Lote").slice(0, 3);
  const rentalProperties = properties.filter((item) => isRentOperation(item.tipoOperacion)).slice(0, 3);

  return (
    <>
      <HeroSection />
      <FeaturedPropertiesSection
        className="pt-4 md:pt-6"
        properties={featuredProperties}
        title="Propiedades de portada"
        description="Residencias y departamentos de alto nivel con excelente ubicacion y calidad constructiva."
        ctaTo={ROUTES.properties}
        ctaLabel="Ver mas"
      />
      <PremiumZoneSection />
      <FeaturedPropertiesSection
        properties={lotsProperties}
        eyebrow="Desarrollos"
        title="Lotes"
        description="Oportunidades de tierra premium para proyectos residenciales e inversion de largo plazo."
        cardCoverMode="lot-overlay"
        ctaTo={`${ROUTES.properties}?tipo=lote`}
        ctaLabel="Ver mas"
      />
      <FeaturedPropertiesSection
        properties={rentalProperties}
        eyebrow="Portafolio activo"
        title="Alquileres"
        description="Seleccion de propiedades disponibles para alquiler con perfil ejecutivo y familiar."
        ctaTo={ROUTES.rentals}
        ctaLabel="Ver mas"
      />
      <TestimonialsSection testimonials={MOCK_TESTIMONIALS} />
      <ContactSection />
    </>
  );
}
