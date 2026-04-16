import { emptyProperty } from "../models/propertyModel";
import { MOCK_PROPERTIES } from "../mocks/properties";
import { normalizePolygonPoints } from "../utils/polygon";
import { slugify } from "../utils/format";
import { fetchProperties, upsertPropertyById, deleteProperty as deletePropertyById } from "../firebase/firestore";

const PROPERTIES_STORAGE_KEY = "allianz.properties.v1";
const SALES_STORAGE_KEY = "allianz.sales.v1";
const listeners = new Set();
let syncingPromise = null;
let hasCloudSync = false;

function normalizeLotOverlay(overlay, fallbackLabel = "", legacyBoundary = null) {
  const source = overlay || legacyBoundary || {};
  const points = normalizePolygonPoints(source?.points || []);
  return {
    imageUrl: String(source?.imageUrl || "").trim(),
    points,
    closed: Boolean(source?.closed),
    enabled:
      source?.enabled === undefined
        ? Boolean(String(source?.imageUrl || "").trim() || points.length > 0)
        : Boolean(source?.enabled),
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
      } else {
        const rawLocal = window.localStorage.getItem(PROPERTIES_STORAGE_KEY);
        const hasLocalSnapshot = Boolean(rawLocal);

        // If cloud is empty and local has data, bootstrap Firestore once.
        if (hasLocalSnapshot) {
          let localItems = [];
          try {
            const parsed = JSON.parse(rawLocal);
            if (Array.isArray(parsed)) {
              localItems = parsed.map((item, index) => normalizeProperty(item, index));
            }
          } catch {
            localItems = [];
          }

          if (localItems.length > 0) {
            for (const item of localItems) {
              await upsertPropertyById(item.id, item);
            }
            const remoteAfterBootstrap = await fetchProperties();
            if (Array.isArray(remoteAfterBootstrap) && remoteAfterBootstrap.length) {
              const normalizedRemote = remoteAfterBootstrap.map((item, index) =>
                normalizeProperty(item, index)
              );
              saveProperties(normalizedRemote);
            }
          }
        } else if (!hasLocalSnapshot) {
          saveProperties(getDefaultProperties());
        }
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

function getStoredSalesRelations() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SALES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export async function removeProperty(identifier) {
  const all = getProperties();
  const target = all.find((item) => item.id === identifier || item.slug === identifier);
  if (!target) {
    return {
      ok: false,
      reason: "not_found",
      message: "La propiedad no existe o ya fue eliminada.",
    };
  }

  const relatedSales = getStoredSalesRelations().filter(
    (sale) => sale.propertyId === target.id || sale.propertyId === target.slug
  );
  if (relatedSales.length > 0) {
    return {
      ok: false,
      reason: "has_relations",
      relatedCount: relatedSales.length,
      message:
        relatedSales.length === 1
          ? "No se puede eliminar: la propiedad tiene 1 venta relacionada."
          : `No se puede eliminar: la propiedad tiene ${relatedSales.length} ventas relacionadas.`,
    };
  }

  const next = all.filter((item) => item.id !== target.id);
  saveProperties(next);

  try {
    await deletePropertyById(target.id);
    return {
      ok: true,
      synced: true,
      message: "Propiedad eliminada correctamente.",
    };
  } catch {
    return {
      ok: true,
      synced: false,
      message:
        "Se elimino localmente, pero no se pudo sincronizar la eliminacion en Firestore.",
    };
  }
}
