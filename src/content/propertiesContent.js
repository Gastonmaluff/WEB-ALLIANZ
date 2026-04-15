import { emptyProperty } from "../models/propertyModel";
import { MOCK_PROPERTIES } from "../mocks/properties";
import { normalizePolygonPoints } from "../utils/polygon";
import { slugify } from "../utils/format";
import { fetchProperties, upsertPropertyById } from "../firebase/firestore";

const PROPERTIES_STORAGE_KEY = "allianz.properties.v1";
const listeners = new Set();
let syncingPromise = null;
let hasCloudSync = false;

function normalizeLotOverlay(overlay, fallbackLabel = "", legacyBoundary = null) {
  const source = overlay || legacyBoundary || {};
  return {
    imageUrl: String(source?.imageUrl || "").trim(),
    points: normalizePolygonPoints(source?.points || []),
    closed: Boolean(source?.closed),
    strokeColor: String(source?.strokeColor || "#7DD3FC"),
    strokeWidth: Number(source?.strokeWidth || 0.75),
    fillColor: String(source?.fillColor || "#50BEFF"),
    fillOpacity: Number(source?.fillOpacity ?? 0.18),
    animationDuration: Number(source?.animationDuration || 1.35),
    animate: source?.animate !== false,
    animateOnView: source?.animateOnView !== false,
    animateOnce: source?.animateOnce !== false,
    showLabel: source?.showLabel !== false,
    labelTitle: String(source?.labelTitle || source?.label || fallbackLabel || "").trim(),
    labelSubtitle: String(source?.labelSubtitle || "").trim(),
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
    lotOverlay: normalizeLotOverlay(
      item?.lotOverlay,
      defaultLabel,
      item?.loteDelimitacion
    ),
    createdAt: String(item?.createdAt || new Date().toISOString()),
  };
}

function getDefaultProperties() {
  return MOCK_PROPERTIES.map((item, index) => normalizeProperty(item, index));
}

function notifyPropertiesChanged(items) {
  listeners.forEach((listener) => {
    try {
      listener(items);
    } catch {
      // no-op
    }
  });
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
  notifyPropertiesChanged(normalized);
  return normalized;
}

export function subscribeProperties(listener) {
  if (typeof listener !== "function") return () => {};
  listeners.add(listener);
  listener(getProperties());
  return () => listeners.delete(listener);
}

export function getPropertyBySlug(slug) {
  return getProperties().find((item) => item.slug === slug);
}

export async function syncPropertiesFromCloud({ force = false } = {}) {
  if (typeof window === "undefined") return getProperties();
  if (hasCloudSync && !force) return getProperties();
  if (syncingPromise) return syncingPromise;

  syncingPromise = (async () => {
    try {
      const remote = await fetchProperties();
      if (Array.isArray(remote) && remote.length) {
        const normalizedRemote = remote.map((item, index) => normalizeProperty(item, index));
        saveProperties(normalizedRemote);
      } else if (!window.localStorage.getItem(PROPERTIES_STORAGE_KEY)) {
        saveProperties(getDefaultProperties());
      }
      hasCloudSync = true;
      return getProperties();
    } catch {
      return getProperties();
    } finally {
      syncingPromise = null;
    }
  })();

  return syncingPromise;
}

export async function upsertProperty(property) {
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
  const saved = saveProperties(all);
  try {
    await upsertPropertyById(normalized.id, normalized);
  } catch {
    // fallback local already done
  }
  return saved;
}
