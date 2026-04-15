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

function createGestion({ usuario, resultado, nota }) {
  return {
    id: `g-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    usuario: usuario || "Administrador Allianz",
    fecha: new Date().toISOString(),
    resultado: String(resultado || "").trim(),
    nota: String(nota || "").trim(),
  };
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
      gestiones: [
        createGestion({
          usuario: "Administrador Allianz",
          resultado: "interesado",
          nota: "Pide propuesta formal esta semana.",
        }),
      ],
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
      gestiones: [],
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
      gestiones: [],
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
      gestiones: [],
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
      gestiones: [],
    },
  ];
}

function normalizeGestion(item, index) {
  return {
    id: item?.id || `g-${Date.now()}-${index}`,
    usuario: String(item?.usuario || "Administrador Allianz"),
    fecha: String(item?.fecha || new Date().toISOString()),
    resultado: String(item?.resultado || "").trim(),
    nota: String(item?.nota || "").trim(),
  };
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
    gestiones: Array.isArray(item?.gestiones)
      ? item.gestiones.map(normalizeGestion).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      : [],
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

export function updateClientNextContact(clientId, nextDate) {
  const todayISO = toISODate(new Date());
  const nextISO = nextDate ? toISODate(nextDate) : "";
  const all = getClients().map((client) =>
    client.id === clientId
      ? {
          ...client,
          fechaUltimoContacto: todayISO,
          fechaProximoContacto: nextISO,
        }
      : client
  );
  return saveClients(all);
}

function mapResultToStatus(result) {
  const value = String(result || "").toLowerCase();
  if (value === "interesado") return "interesado";
  if (value === "quiere ver") return "visita agendada";
  if (value === "no le interesa") return "cerrado";
  return "contactado";
}

export function registerClientManagement({
  clientId,
  usuario,
  resultado,
  nota,
  fechaProximoContacto,
}) {
  const all = getClients();
  const nextISO = fechaProximoContacto ? toISODate(fechaProximoContacto) : "";
  const todayISO = toISODate(new Date());
  const updated = all.map((client) => {
    if (client.id !== clientId) return client;
    const gestiones = [
      createGestion({ usuario, resultado, nota }),
      ...(client.gestiones || []),
    ];
    return {
      ...client,
      estado: mapResultToStatus(resultado),
      fechaUltimoContacto: todayISO,
      fechaProximoContacto: nextISO || client.fechaProximoContacto,
      gestiones,
    };
  });
  return saveClients(updated);
}

