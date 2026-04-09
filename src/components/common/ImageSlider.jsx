import { useEffect, useMemo, useState } from "react";

const tones = {
  light: {
    button: "border-white/45 bg-black/20 text-white hover:bg-black/40",
    dotActive: "bg-white",
    dotInactive: "bg-white/35 hover:bg-white/60",
  },
  dark: {
    button: "border-ink/20 bg-paper/70 text-ink hover:bg-paper",
    dotActive: "bg-ink",
    dotInactive: "bg-ink/20 hover:bg-ink/40",
  },
};

export function ImageSlider({
  images = [],
  altPrefix = "Imagen",
  autoPlayMs = 0,
  showArrows = true,
  showIndicators = true,
  pauseOnHover = true,
  tone = "light",
  containerClassName = "",
  imageClassName = "",
  controlsClassName = "",
  indicatorsClassName = "",
}) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const canSlide = safeImages.length > 1;
  const theme = tones[tone] || tones.light;

  useEffect(() => {
    setActiveIndex(0);
  }, [safeImages.length]);

  useEffect(() => {
    if (!canSlide || !autoPlayMs) return undefined;
    if (pauseOnHover && isHovering) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeImages.length);
    }, autoPlayMs);

    return () => clearInterval(timer);
  }, [autoPlayMs, canSlide, safeImages.length, isHovering, pauseOnHover]);

  const goTo = (index) => setActiveIndex(index);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % safeImages.length);

  if (!safeImages.length) return null;

  return (
    <div
      className={`relative overflow-hidden ${containerClassName}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {safeImages.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt={`${altPrefix} ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          } ${imageClassName}`}
        />
      ))}

      {showArrows && canSlide ? (
        <div className={`pointer-events-none absolute inset-x-3 top-1/2 z-20 -translate-y-1/2 ${controlsClassName}`}>
          <div className="flex justify-between">
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goPrev();
              }}
              className={`pointer-events-auto inline-flex h-8 w-8 items-center justify-center border text-sm transition ${theme.button}`}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Siguiente imagen"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goNext();
              }}
              className={`pointer-events-auto inline-flex h-8 w-8 items-center justify-center border text-sm transition ${theme.button}`}
            >
              ›
            </button>
          </div>
        </div>
      ) : null}

      {showIndicators && canSlide ? (
        <div className={`absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5 ${indicatorsClassName}`}>
          {safeImages.map((_, index) => (
            <button
              key={`indicator-${index}`}
              type="button"
              aria-label={`Ir a imagen ${index + 1}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goTo(index);
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? `w-5 ${theme.dotActive}` : `w-2 ${theme.dotInactive}`
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
