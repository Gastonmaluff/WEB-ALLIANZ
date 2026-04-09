import { HeroSection } from "../../components/public/HeroSection";
import { FeaturedPropertiesSection } from "../../components/public/FeaturedPropertiesSection";
import { TestimonialsSection } from "../../components/public/TestimonialsSection";
import { ContactSection } from "../../components/public/ContactSection";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { MOCK_TESTIMONIALS } from "../../mocks/testimonials";

export function HomePage() {
  const featuredProperties = MOCK_PROPERTIES.filter((item) => item.destacadaEnPortada).slice(0, 3);

  return (
    <>
      <HeroSection />
      <FeaturedPropertiesSection properties={featuredProperties} />
      <TestimonialsSection testimonials={MOCK_TESTIMONIALS} />
      <ContactSection />
    </>
  );
}
