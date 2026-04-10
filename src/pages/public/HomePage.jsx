import { HeroSection } from "../../components/public/HeroSection";
import { FeaturedPropertiesSection } from "../../components/public/FeaturedPropertiesSection";
import { TestimonialsSection } from "../../components/public/TestimonialsSection";
import { ContactSection } from "../../components/public/ContactSection";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { MOCK_TESTIMONIALS } from "../../mocks/testimonials";
import { ROUTES } from "../../router/paths";

function isRentOperation(value) {
  return value === "alquiler" || value === "venta_o_alquiler";
}

export function HomePage() {
  const featuredProperties = MOCK_PROPERTIES.filter((item) => item.destacadaEnPortada).slice(0, 3);
  const lotsProperties = MOCK_PROPERTIES.filter((item) => item.tipoPropiedad === "Lote").slice(0, 3);
  const rentalProperties = MOCK_PROPERTIES.filter((item) => isRentOperation(item.tipoOperacion)).slice(0, 3);

  return (
    <>
      <HeroSection />
      <FeaturedPropertiesSection
        className="pt-8 md:pt-12"
        properties={featuredProperties}
        title="Propiedades de portada"
        description="Residencias y departamentos de alto nivel con excelente ubicacion y calidad constructiva."
        ctaTo={ROUTES.properties}
        ctaLabel="Ver mas"
      />
      <FeaturedPropertiesSection
        properties={lotsProperties}
        eyebrow="Desarrollos"
        title="Lotes"
        description="Oportunidades de tierra premium para proyectos residenciales e inversion de largo plazo."
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
