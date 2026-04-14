import { emptyClient } from "../models/clientModel";

const CLIENTS_STORAGE_KEY = "allianz.clients.v1";

function toISODate(date) {
  const local = new Date(date);
  const timezoneOffset = local.getTimezoneOffset() * 60000;
  return new Date(local.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function addDays(base, days) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function createDefaultClients() {
  const today = new Date();
  return [
    {
      id: "c-1",
      nombre: "Marina Duarte",
      telefono: "595981111111",
      tipoCliente: "inversionista",
      propiedadInteres: "The Glass Villa",
      estado: "negociacion",
      fechaUltimoContacto: toISODate(addDays(today, -2)),
      fechaProximoContacto: toISODate(today),
    },
    {
      id: "c-2",
      nombre: "Carlos Acosta",
      telefono: "595981222222",
      tipoCliente: "comprador",
      propiedadInteres: "Vanguard Residence",
      estado: "visita agendada",
      fechaUltimoContacto: toISODate(addDays(today, -4)),
      fechaProximoContacto: toISODate(addDays(today, -1)),
    },
    {
      id: "c-3",
      nombre: "Sandra Franco",
      telefono: "595981333333",
      tipoCliente: "inquilino",
      propiedadInteres: "Mono Residence",
      estado: "interesado",
      fechaUltimoContacto: toISODate(addDays(today, -1)),
      fechaProximoContacto: toISODate(addDays(today, 1)),
    },
    {
      id: "c-4",
      nombre: "Gaston Aguilera",
      telefono: "595981444444",
      tipoCliente: "comprador",
      propiedadInteres: "Lote Las Palmeras I",
      estado: "contactado",
      fechaUltimoContacto: toISODate(today),
      fechaProximoContacto: toISODate(addDays(today, 3)),
    },
    {
      id: "c-5",
      nombre: "Lucia Villalba",
      telefono: "595981555555",
      tipoCliente: "inversionista",
      propiedadInteres: "Lote Costa Sur",
      estado: "propuesta enviada",
      fechaUltimoContacto: toISODate(addDays(today, -5)),
      fechaProximoContacto: "",
    },
  ];
}

function normalizeClient(item) {
  return {
    ...emptyClient,
    ...item,
    id: item?.id || `c-${Date.now()}`,
    nombre: String(item?.nombre || "").trim(),
    telefono: String(item?.telefono || "").replace(/\s+/g, ""),
    tipoCliente: String(item?.tipoCliente || emptyClient.tipoCliente),
    propiedadInteres: String(item?.propiedadInteres || "").trim(),
    estado: String(item?.estado || emptyClient.estado),
    fechaUltimoContacto: String(item?.fechaUltimoContacto || ""),
    fechaProximoContacto: String(item?.fechaProximoContacto || ""),
  };
}

export function getClients() {
  if (typeof window === "undefined") return createDefaultClients();
  try {
    const raw = window.localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) return createDefaultClients();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultClients();
    return parsed.map(normalizeClient);
  } catch {
    return createDefaultClients();
  }
}

export function saveClients(items) {
  const normalized = items.map(normalizeClient);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function getClientById(id) {
  return getClients().find((item) => item.id === id);
}

export function upsertClient(client) {
  const normalized = normalizeClient(client);
  const all = getClients();
  const existingIndex = all.findIndex((item) => item.id === normalized.id);
  if (existingIndex >= 0) {
    all[existingIndex] = normalized;
  } else {
    all.unshift({ ...normalized, id: normalized.id || `c-${Date.now()}` });
  }
  return saveClients(all);
}

