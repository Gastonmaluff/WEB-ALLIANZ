export const HERO_CONTENT_STORAGE_KEY = "allianz.heroContent.v1";
export const HERO_CONTENT_UPDATED_EVENT = "allianz:heroContentUpdated";

export const DEFAULT_HERO_CONTENT = {
  eyebrow: "Portfolio 2026",
  title: "Arquitectura de lujo para vivir e invertir.",
  description:
    "Seleccion premium de propiedades en venta y alquiler con enfoque editorial y asesoramiento integral.",
  ctaLabel: "Ver propiedades",
  ctaTo: "/propiedades",
  images: [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1900&q=80",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1900&q=80",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=1900&q=80",
  ],
};

function cloneDefaults() {
  return {
    ...DEFAULT_HERO_CONTENT,
    images: [...DEFAULT_HERO_CONTENT.images],
  };
}

function cleanText(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

function uniqueImages(images) {
  if (!Array.isArray(images)) return [];
  return [...new Set(images.map((image) => (typeof image === "string" ? image.trim() : "")).filter(Boolean))];
}

export function normalizeHeroContent(rawContent) {
  const base = cloneDefaults();
  const parsed = rawContent && typeof rawContent === "object" ? rawContent : {};
  const images = uniqueImages(parsed.images);

  return {
    eyebrow: cleanText(parsed.eyebrow, base.eyebrow),
    title: cleanText(parsed.title, base.title),
    description: cleanText(parsed.description, base.description),
    ctaLabel: cleanText(parsed.ctaLabel, base.ctaLabel),
    ctaTo: cleanText(parsed.ctaTo, base.ctaTo),
    images: images.length ? images : base.images,
  };
}

export function getHeroContent() {
  if (typeof window === "undefined") return cloneDefaults();
  try {
    const stored = window.localStorage.getItem(HERO_CONTENT_STORAGE_KEY);
    if (!stored) return cloneDefaults();
    return normalizeHeroContent(JSON.parse(stored));
  } catch {
    return cloneDefaults();
  }
}

function emitHeroUpdated(detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HERO_CONTENT_UPDATED_EVENT, { detail }));
}

export function saveHeroContent(content) {
  const normalized = normalizeHeroContent(content);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HERO_CONTENT_STORAGE_KEY, JSON.stringify(normalized));
    emitHeroUpdated(normalized);
  }
  return normalized;
}

export function resetHeroContent() {
  const defaults = cloneDefaults();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(HERO_CONTENT_STORAGE_KEY);
    emitHeroUpdated(defaults);
  }
  return defaults;
}

