import { useMemo, useState } from "react";
import { AppButton } from "../../components/common/AppButton";
import {
  deleteCommercialEvent,
  getCommercialEvents,
  upsertCommercialEvent,
} from "../../content/commercialEventsContent";
import { getClients } from "../../content/clientsContent";
import { ROUTES } from "../../router/paths";
import {
  COMMERCIAL_ACTION_TYPES,
  COMMERCIAL_EVENT_STATUS,
} from "../../models/commercialEventModel";
import { toTitle } from "../../utils/format";

const DAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function toISODate(date) {
  const local = new Date(date);
  local.setHours(0, 0, 0, 0);
  const timezoneOffset = local.getTimezoneOffset() * 60000;
  return new Date(local.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function parseISODate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat("es-PY", { month: "long", year: "numeric" }).format(date);
}

function buildMonthGrid(monthDate) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const startDayIndex = (monthStart.getDay() + 6) % 7;
  const endDayIndex = (monthEnd.getDay() + 6) % 7;

  const gridStart = addDays(monthStart, -startDayIndex);
  const gridEnd = addDays(monthEnd, 6 - endDayIndex);

  const days = [];
  for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    days.push({
      iso: toISODate(cursor),
      day: cursor.getDate(),
      inCurrentMonth: cursor.getMonth() === monthDate.getMonth(),
    });
  }
  return days;
}

function getActionBadge(actionType) {
  if (actionType === "visita") return "bg-violet-50 text-violet-700 ring-violet-200";
  if (actionType === "llamada") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (actionType === "recordatorio") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
}

function getStatusBadge(status) {
  if (status === "realizado") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "reprogramado") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "cancelado") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}

function createFollowUpEvents(clients) {
  return clients
    .filter((client) => client.fechaProximoContacto)
    .map((client) => ({
      id: `follow-up-${client.id}-${client.fechaProximoContacto}`,
      date: client.fechaProximoContacto,
      clientId: client.id,
      clientName: client.nombre,
      propertyRef: client.propiedadInteres || "Sin propiedad definida",
      actionType: "seguimiento",
      assignedSeller: client.gestiones?.[0]?.usuario || "Sin asignar",
      status: "pendiente",
      notes: "Seguimiento generado desde proximo contacto del cliente.",
      source: "followup",
    }));
}

function formatLongDate(isoValue) {
  const date = parseISODate(isoValue);
  if (!date) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PY", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function AdminCalendarPage() {
  const todayISO = toISODate(new Date());
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [manualEvents, setManualEvents] = useState(() => getCommercialEvents());
  const [form, setForm] = useState({
    date: todayISO,
    clientId: "",
    actionType: "seguimiento",
    assignedSeller: "",
    status: "pendiente",
    propertyRef: "",
    notes: "",
  });

  const clients = useMemo(() => getClients(), []);

  const allEvents = useMemo(() => {
    const followUpEvents = createFollowUpEvents(clients);
    const localEvents = manualEvents.map((item) => ({ ...item, source: "manual" }));
    return [...followUpEvents, ...localEvents].sort((a, b) => a.date.localeCompare(b.date));
  }, [clients, manualEvents]);

  const eventCountByDate = useMemo(() => {
    return allEvents.reduce((acc, event) => {
      if (!event.date) return acc;
      acc[event.date] = (acc[event.date] || 0) + 1;
      return acc;
    }, {});
  }, [allEvents]);

  const monthDays = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const selectedDayEvents = useMemo(() => {
    return allEvents.filter((event) => event.date === selectedDate);
  }, [allEvents, selectedDate]);

  const stats = useMemo(() => {
    return {
      total: allEvents.length,
      seguimientos: allEvents.filter((item) => item.actionType === "seguimiento").length,
      visitas: allEvents.filter((item) => item.actionType === "visita").length,
      llamadas: allEvents.filter((item) => item.actionType === "llamada").length,
      recordatorios: allEvents.filter((item) => item.actionType === "recordatorio").length,
    };
  }, [allEvents]);

  const selectedClient = useMemo(
    () => clients.find((item) => item.id === form.clientId),
    [clients, form.clientId]
  );

  const setPrevMonth = () => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const setNextMonth = () => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onClientChange = (clientId) => {
    const client = clients.find((item) => item.id === clientId);
    setForm((prev) => ({
      ...prev,
      clientId,
      propertyRef: client?.propiedadInteres || prev.propertyRef,
      assignedSeller: client?.gestiones?.[0]?.usuario || prev.assignedSeller,
    }));
  };

  const saveEvent = (event) => {
    event.preventDefault();
    if (!form.date || !form.clientId) return;
    const client = selectedClient;
    upsertCommercialEvent(
      {
        id: `ce-${Date.now()}`,
        date: form.date,
        clientId: form.clientId,
        clientName: client?.nombre || "",
        propertyRef: form.propertyRef || client?.propiedadInteres || "",
        actionType: form.actionType,
        assignedSeller: form.assignedSeller || "Sin asignar",
        status: form.status,
        notes: form.notes,
      },
      {
        userName: form.assignedSeller || "Administrador Allianz",
      }
    );
    setManualEvents(getCommercialEvents());
    setForm((prev) => ({
      ...prev,
      actionType: "seguimiento",
      status: "pendiente",
      notes: "",
    }));
  };

  const removeEvent = (eventId, source) => {
    if (source !== "manual") return;
    deleteCommercialEvent(eventId);
    setManualEvents(getCommercialEvents());
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Gestion comercial</p>
          <h1 className="font-display text-5xl leading-none text-ink">Calendario</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate">
            Agenda centralizada para seguimientos, llamadas, visitas y recordatorios con foco diario.
          </p>
        </div>
        <AppButton to={ROUTES.adminClients} variant="ghost">
          Ver clientes
        </AppButton>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <article className="admin-card p-4">
          <p className="text-[11px] uppercase tracking-editorial text-slate">Eventos totales</p>
          <p className="mt-1 font-display text-3xl text-ink">{stats.total}</p>
        </article>
        <article className="admin-card p-4">
          <p className="text-[11px] uppercase tracking-editorial text-slate">Seguimientos</p>
          <p className="mt-1 font-display text-3xl text-ink">{stats.seguimientos}</p>
        </article>
        <article className="admin-card p-4">
          <p className="text-[11px] uppercase tracking-editorial text-slate">Llamadas</p>
          <p className="mt-1 font-display text-3xl text-ink">{stats.llamadas}</p>
        </article>
        <article className="admin-card p-4">
          <p className="text-[11px] uppercase tracking-editorial text-slate">Visitas</p>
          <p className="mt-1 font-display text-3xl text-ink">{stats.visitas}</p>
        </article>
        <article className="admin-card p-4">
          <p className="text-[11px] uppercase tracking-editorial text-slate">Recordatorios</p>
          <p className="mt-1 font-display text-3xl text-ink">{stats.recordatorios}</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <article className="admin-card p-0">
          <div className="flex items-center justify-between border-b border-stone px-4 py-3">
            <button
              type="button"
              onClick={setPrevMonth}
              className="inline-flex h-9 w-9 items-center justify-center border border-stone bg-white text-ink transition hover:border-ink"
              aria-label="Mes anterior"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="m12.5 4.5-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <h2 className="font-display text-3xl capitalize text-ink">{getMonthLabel(monthCursor)}</h2>
            <button
              type="button"
              onClick={setNextMonth}
              className="inline-flex h-9 w-9 items-center justify-center border border-stone bg-white text-ink transition hover:border-ink"
              aria-label="Mes siguiente"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="m7.5 4.5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-stone bg-surface px-4 py-2">
            {DAY_LABELS.map((day) => (
              <p key={day} className="text-center text-[11px] font-semibold uppercase tracking-editorial text-slate">
                {day}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-stone/70 p-px">
            {monthDays.map((day) => {
              const selected = day.iso === selectedDate;
              const isToday = day.iso === todayISO;
              const count = eventCountByDate[day.iso] || 0;
              return (
                <button
                  type="button"
                  key={day.iso}
                  onClick={() => {
                    setSelectedDate(day.iso);
                    setForm((prev) => ({ ...prev, date: day.iso }));
                  }}
                  className={`relative min-h-20 bg-paper px-1.5 py-2 text-center text-sm transition md:min-h-24 ${
                    day.inCurrentMonth ? "text-ink" : "text-slate/65"
                  } ${selected ? "ring-2 ring-[#041B2C]" : ""}`}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday ? "bg-[#041B2C] text-white" : ""
                    }`}
                  >
                    {day.day}
                  </span>
                  {count > 0 ? (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-[#041B2C] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </article>

        <div className="space-y-4">
          <article className="admin-card p-5">
            <p className="text-xs uppercase tracking-editorial text-slate">Dia seleccionado</p>
            <h3 className="mt-1 font-display text-3xl text-ink capitalize">{formatLongDate(selectedDate)}</h3>

            <div className="mt-4 space-y-2">
              {selectedDayEvents.length ? (
                selectedDayEvents.map((event) => (
                  <article key={event.id} className="border border-stone bg-surface px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${getActionBadge(
                          event.actionType
                        )}`}
                      >
                        {toTitle(event.actionType)}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${getStatusBadge(
                          event.status
                        )}`}
                      >
                        {toTitle(event.status)}
                      </span>
                      <span className="ml-auto text-[10px] uppercase tracking-editorial text-slate">
                        {event.source === "manual" ? "Manual" : "Seguimiento"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink">{event.clientName || "Cliente sin nombre"}</p>
                    <p className="text-xs text-slate">
                      {event.propertyRef || "Sin propiedad"} - Vendedor: {event.assignedSeller || "Sin asignar"}
                    </p>
                    {event.notes ? <p className="mt-1 text-xs text-slate">{event.notes}</p> : null}
                    {event.source === "manual" ? (
                      <button
                        type="button"
                        onClick={() => removeEvent(event.id, event.source)}
                        className="mt-2 text-[10px] uppercase tracking-editorial text-[#7A2A2A] hover:underline"
                      >
                        Eliminar evento
                      </button>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="border border-stone bg-surface px-3 py-3 text-sm text-slate">
                  No hay eventos para esta fecha.
                </p>
              )}
            </div>
          </article>

          <article className="admin-card p-5">
            <h3 className="font-display text-3xl text-ink">Agregar evento</h3>
            <p className="mt-1 text-sm text-slate">
              Carga llamadas, visitas o recordatorios para cada cliente.
            </p>
            <form className="mt-4 grid gap-3" onSubmit={saveEvent}>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Fecha</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
                  required
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Cliente</span>
                <select
                  value={form.clientId}
                  onChange={(event) => onClientChange(event.target.value)}
                  className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
                  required
                >
                  <option value="">Selecciona cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Accion</span>
                  <select
                    value={form.actionType}
                    onChange={(event) => updateField("actionType", event.target.value)}
                    className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
                  >
                    {COMMERCIAL_ACTION_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {toTitle(option)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Estado</span>
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
                  >
                    {COMMERCIAL_EVENT_STATUS.map((option) => (
                      <option key={option} value={option}>
                        {toTitle(option)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-editorial text-slate">
                  Propiedad o lote
                </span>
                <input
                  value={form.propertyRef}
                  onChange={(event) => updateField("propertyRef", event.target.value)}
                  placeholder="Ej: Lote Las Palmeras II"
                  className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Vendedor</span>
                <input
                  value={form.assignedSeller}
                  onChange={(event) => updateField("assignedSeller", event.target.value)}
                  placeholder="Ej: Administrador Allianz"
                  className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Notas</span>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
                  placeholder="Dato util para la siguiente gestion"
                />
              </label>

              <AppButton type="submit">Guardar evento</AppButton>
            </form>
          </article>
        </div>
      </div>
    </section>
  );
}
