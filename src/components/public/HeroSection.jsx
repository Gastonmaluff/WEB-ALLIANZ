import { useEffect, useState } from "react";
import { AppButton } from "../common/AppButton";
import { ROUTES } from "../../router/paths";
import { ImageSlider } from "../common/ImageSlider";
import {
  getHeroContent,
  HERO_CONTENT_STORAGE_KEY,
  HERO_CONTENT_UPDATED_EVENT,
} from "../../content/heroContent";

export function HeroSection() {
  const [heroContent, setHeroContent] = useState(() => getHeroContent());

  useEffect(() => {
    const syncHero = () => setHeroContent(getHeroContent());
    const onStorage = (event) => {
      if (event.key === HERO_CONTENT_STORAGE_KEY || event.key === null) {
        syncHero();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(HERO_CONTENT_UPDATED_EVENT, syncHero);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(HERO_CONTENT_UPDATED_EVENT, syncHero);
    };
  }, []);

  return (
    <section className="pt-10 pb-6 md:pt-14 md:pb-10">
      <div className="container">
        <div className="relative grid overflow-hidden border-fine bg-paper lg:grid-cols-12">
          <div className="relative z-10 bg-paper p-7 sm:p-9 lg:col-span-5 lg:bg-hero-fade lg:p-14">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-editorial text-slate">
              {heroContent.eyebrow}
            </p>
            <h1 className="mb-5 text-5xl leading-[0.95] text-ink md:text-6xl lg:text-7xl">
              {heroContent.title}
            </h1>
            <p className="mb-8 max-w-md text-base leading-relaxed text-slate">
              {heroContent.description}
            </p>
            <AppButton to={heroContent.ctaTo || ROUTES.properties}>
              {heroContent.ctaLabel}
            </AppButton>
          </div>

          <div className="lg:col-span-7">
            <ImageSlider
              images={heroContent.images}
              altPrefix="Hero Allianz"
              autoPlayMs={7000}
              tone="light"
              showIndicators
              showArrows
              containerClassName="h-[320px] sm:h-[390px] lg:h-[620px]"
              controlsClassName="md:inset-x-4"
              indicatorsClassName="pb-1 lg:pb-2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
