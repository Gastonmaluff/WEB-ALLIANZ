import { emptyProperty } from "../models/propertyModel";
import { MOCK_PROPERTIES } from "../mocks/properties";
import { normalizePolygonPoints } from "../utils/polygon";
import { slugify } from "../utils/format";

const PROPERTIES_STORAGE_KEY = "allianz.properties.v1";

function normalizeLotBoundary(boundary, fallbackLabel = "") {
  return {
    imageUrl: String(boundary?.imageUrl || "").trim(),
    points: normalizePolygonPoints(boundary?.points || []),
    closed: Boolean(boundary?.closed),
    label: String(boundary?.label || fallbackLabel || "").trim(),
    showLabel: boundary?.showLabel !== false,
  };
}

function normalizeProperty(item, index = 0) {
  const title = String(item?.titulo || "").trim();
  const slug = String(item?.slug || "").trim() || slugify(title);
  const defaultLabel = item?.superficie ? `${item.superficie} m2` : "";

  return {
    ...emptyProperty,
    ...item,
    id: String(item?.id || slug || `property-${Date.now()}-${index}`),
    titulo: title,
    slug,
    tipoOperacion: String(item?.tipoOperacion || "venta"),
    tipoPropiedad: String(item?.tipoPropiedad || ""),
    precio: Number(item?.precio || 0),
    consultarPrecio: Boolean(item?.consultarPrecio),
    moneda: String(item?.moneda || "USD"),
    ubicacion: String(item?.ubicacion || "").trim(),
    googleMapsUrl: String(item?.googleMapsUrl || "").trim(),
    superficie: Number(item?.superficie || 0),
    dormitorios: Number(item?.dormitorios || 0),
    banos: Number(item?.banos || 0),
    cochera: Number(item?.cochera || 0),
    caracteristicasExtras: Array.isArray(item?.caracteristicasExtras) ? item.caracteristicasExtras : [],
    descripcionCorta: String(item?.descripcionCorta || "").trim(),
    descripcionLarga: String(item?.descripcionLarga || "").trim(),
    estado: String(item?.estado || "disponible"),
    imagenPrincipal: String(item?.imagenPrincipal || "").trim(),
    imagenes: Array.isArray(item?.imagenes) ? item.imagenes.filter(Boolean) : [],
    destacadaEnPortada: Boolean(item?.destacadaEnPortada),
    publicada: item?.publicada !== false,
    loteDelimitacion: normalizeLotBoundary(item?.loteDelimitacion, defaultLabel),
    createdAt: String(item?.createdAt || new Date().toISOString()),
  };
}

function getDefaultProperties() {
  return MOCK_PROPERTIES.map((item, index) => normalizeProperty(item, index));
}

export function getProperties() {
  if (typeof window === "undefined") return getDefaultProperties();
  try {
    const raw = window.localStorage.getItem(PROPERTIES_STORAGE_KEY);
    if (!raw) return getDefaultProperties();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getDefaultProperties();
    return parsed.map((item, index) => normalizeProperty(item, index));
  } catch {
    return getDefaultProperties();
  }
}

export function saveProperties(items) {
  const normalized = items.map((item, index) => normalizeProperty(item, index));
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function getPropertyBySlug(slug) {
  return getProperties().find((item) => item.slug === slug);
}

export function upsertProperty(property) {
  const all = getProperties();
  const normalized = normalizeProperty(property);
  const existingIndex = all.findIndex((item) => item.id === normalized.id || item.slug === normalized.slug);
  if (existingIndex >= 0) {
    all[existingIndex] = {
      ...all[existingIndex],
      ...normalized,
    };
  } else {
    all.unshift(normalized);
  }
  return saveProperties(all);
}
