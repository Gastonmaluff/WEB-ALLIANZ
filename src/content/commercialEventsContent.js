import { emptyCommercialEvent } from "../models/commercialEventModel";

const COMMERCIAL_EVENTS_STORAGE_KEY = "allianz.commercial.events.v1";

function normalizeEvent(item) {
  const now = new Date().toISOString();
  return {
    ...emptyCommercialEvent,
    ...item,
    id: item?.id || `ce-${Date.now()}`,
    date: String(item?.date || ""),
    clientId: String(item?.clientId || ""),
    clientName: String(item?.clientName || "").trim(),
    propertyRef: String(item?.propertyRef || "").trim(),
    actionType: String(item?.actionType || "seguimiento"),
    assignedSeller: String(item?.assignedSeller || "").trim(),
    status: String(item?.status || "pendiente"),
    notes: String(item?.notes || "").trim(),
    createdAt: String(item?.createdAt || now),
    createdBy: String(item?.createdBy || "Administrador Allianz"),
    updatedAt: String(item?.updatedAt || now),
    updatedBy: String(item?.updatedBy || "Administrador Allianz"),
  };
}

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

function createDefaultEvents() {
  const today = new Date();
  return [
    normalizeEvent({
      id: "ce-1",
      date: toISODate(today),
      clientId: "c-1",
      clientName: "Marina Duarte",
      propertyRef: "The Glass Villa",
      actionType: "visita",
      assignedSeller: "Administrador Allianz",
      status: "pendiente",
      notes: "Confirmar horario de recorrido y documentacion previa.",
    }),
    normalizeEvent({
      id: "ce-2",
      date: toISODate(addDays(today, 1)),
      clientId: "c-2",
      clientName: "Carlos Acosta",
      propertyRef: "Vanguard Residence",
      actionType: "llamada",
      assignedSeller: "Administrador Allianz",
      status: "pendiente",
      notes: "Follow-up de propuesta y ajuste de condiciones.",
    }),
  ];
}

export function getCommercialEvents() {
  if (typeof window === "undefined") return createDefaultEvents();
  try {
    const raw = window.localStorage.getItem(COMMERCIAL_EVENTS_STORAGE_KEY);
    if (!raw) return createDefaultEvents();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultEvents();
    return parsed.map(normalizeEvent);
  } catch {
    return createDefaultEvents();
  }
}

export function saveCommercialEvents(items) {
  const normalized = items.map(normalizeEvent);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(COMMERCIAL_EVENTS_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function upsertCommercialEvent(event, { userName = "Administrador Allianz" } = {}) {
  const all = getCommercialEvents();
  const existingIndex = all.findIndex((item) => item.id === event.id);
  const now = new Date().toISOString();
  const normalized = normalizeEvent({
    ...event,
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
      id: normalized.id || `ce-${Date.now()}`,
      createdAt: normalized.createdAt || now,
      createdBy: normalized.createdBy || userName,
      updatedAt: now,
      updatedBy: userName,
    });
  }

  return saveCommercialEvents(all);
}

export function deleteCommercialEvent(id) {
  return saveCommercialEvents(getCommercialEvents().filter((item) => item.id !== id));
}
