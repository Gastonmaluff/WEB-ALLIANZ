import { emptySale } from "../models/saleModel";

const SALES_STORAGE_KEY = "allianz.sales.v1";

function toISODate(date) {
  const local = new Date(date);
  const timezoneOffset = local.getTimezoneOffset() * 60000;
  return new Date(local.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSaleFile(file, index = 0) {
  const now = new Date().toISOString();
  return {
    id: file?.id || `sf-${Date.now()}-${index}`,
    type: String(file?.type || "otro"),
    name: String(file?.name || "Documento").trim(),
    url: String(file?.url || "").trim(),
    uploadedAt: String(file?.uploadedAt || now),
    uploadedBy: String(file?.uploadedBy || "Administrador Allianz"),
  };
}

function normalizeSale(item) {
  const now = new Date().toISOString();
  return {
    ...emptySale,
    ...item,
    id: item?.id || `s-${Date.now()}`,
    clientId: String(item?.clientId || "").trim(),
    clienteNombre: String(item?.clienteNombre || "").trim(),
    clienteTelefono: String(item?.clienteTelefono || "").trim(),
    clienteEmail: String(item?.clienteEmail || "").trim(),
    clienteDocumento: String(item?.clienteDocumento || "").trim(),
    vendedorResponsable: String(item?.vendedorResponsable || "").trim(),
    fechaVenta: String(item?.fechaVenta || ""),
    tipoInmueble: String(item?.tipoInmueble || "lote"),
    origenVenta: String(item?.origenVenta || "web"),
    propertyId: String(item?.propertyId || "").trim(),
    propertyManual: String(item?.propertyManual || "").trim(),
    precioVenta: normalizeNumber(item?.precioVenta),
    moneda: String(item?.moneda || "USD"),
    modalidad: String(item?.modalidad || "contado"),
    senia: normalizeNumber(item?.senia),
    saldoRestante: normalizeNumber(item?.saldoRestante),
    observaciones: String(item?.observaciones || "").trim(),
    cuotasCantidad: normalizeNumber(item?.cuotasCantidad),
    cuotaMonto: normalizeNumber(item?.cuotaMonto),
    frecuencia: String(item?.frecuencia || "mensual"),
    fechaPrimeraCuota: String(item?.fechaPrimeraCuota || ""),
    estado: String(item?.estado || "en negociacion"),
    archivos: Array.isArray(item?.archivos) ? item.archivos.map(normalizeSaleFile) : [],
    createdAt: String(item?.createdAt || now),
    updatedAt: String(item?.updatedAt || now),
    createdBy: String(item?.createdBy || "Administrador Allianz"),
    updatedBy: String(item?.updatedBy || "Administrador Allianz"),
  };
}

function createDefaultSales() {
  return [
    normalizeSale({
      id: "s-1",
      clientId: "c-1",
      clienteNombre: "Marina Duarte",
      clienteTelefono: "595981111111",
      clienteEmail: "marina@example.com",
      vendedorResponsable: "Administrador Allianz",
      fechaVenta: toISODate(new Date()),
      tipoInmueble: "casa",
      origenVenta: "web",
      propertyId: "the-glass-villa",
      precioVenta: 14500000,
      moneda: "USD",
      modalidad: "contado",
      senia: 3000000,
      saldoRestante: 11500000,
      observaciones: "Operacion avanzada con due diligence legal en curso.",
      estado: "en documentacion",
      archivos: [
        normalizeSaleFile({
          id: "sf-1",
          type: "reserva",
          name: "Reserva firmada",
          url: "https://example.com/reserva-marina.pdf",
          uploadedAt: new Date().toISOString(),
          uploadedBy: "Administrador Allianz",
        }),
      ],
      createdBy: "Administrador Allianz",
      updatedBy: "Administrador Allianz",
    }),
    normalizeSale({
      id: "s-2",
      clientId: "c-3",
      clienteNombre: "Sandra Franco",
      clienteTelefono: "595981333333",
      vendedorResponsable: "Administrador Allianz",
      fechaVenta: toISODate(new Date(Date.now() - 86400000 * 3)),
      tipoInmueble: "departamento",
      origenVenta: "externo",
      propertyManual: "Departamento corporativo Torre Costanera",
      precioVenta: 975000,
      moneda: "USD",
      modalidad: "financiado",
      senia: 250000,
      saldoRestante: 725000,
      cuotasCantidad: 24,
      cuotaMonto: 30208,
      frecuencia: "mensual",
      fechaPrimeraCuota: toISODate(new Date(Date.now() + 86400000 * 30)),
      observaciones: "Cliente en proceso de firma de contrato de financiacion.",
      estado: "reservada",
      createdBy: "Administrador Allianz",
      updatedBy: "Administrador Allianz",
    }),
  ];
}

export function getSales() {
  if (typeof window === "undefined") return createDefaultSales();
  try {
    const raw = window.localStorage.getItem(SALES_STORAGE_KEY);
    if (!raw) return createDefaultSales();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultSales();
    return parsed.map(normalizeSale);
  } catch {
    return createDefaultSales();
  }
}

export function saveSales(items) {
  const normalized = items.map(normalizeSale);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function getSaleById(id) {
  return getSales().find((item) => item.id === id);
}

export function upsertSale(sale, { userName = "Administrador Allianz" } = {}) {
  const all = getSales();
  const existingIndex = all.findIndex((item) => item.id === sale.id);
  const now = new Date().toISOString();
  const normalized = normalizeSale({
    ...sale,
    updatedAt: now,
    updatedBy: userName,
  });

  if (existingIndex >= 0) {
    all[existingIndex] = {
      ...all[existingIndex],
      ...normalized,
      createdAt: all[existingIndex].createdAt || normalized.createdAt || now,
      createdBy: all[existingIndex].createdBy || normalized.createdBy || userName,
    };
  } else {
    all.unshift({
      ...normalized,
      id: normalized.id || `s-${Date.now()}`,
      createdAt: normalized.createdAt || now,
      createdBy: normalized.createdBy || userName,
      updatedAt: now,
      updatedBy: userName,
    });
  }

  return saveSales(all);
}

export function deleteSale(id) {
  return saveSales(getSales().filter((item) => item.id !== id));
}
