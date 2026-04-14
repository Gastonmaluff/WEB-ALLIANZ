import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppButton } from "../../components/common/AppButton";
import { getClients, saveClients } from "../../content/clientsContent";
import { ROUTES } from "../../router/paths";
import { toTitle } from "../../utils/format";

function normalizeDate(value) {
  if (!value) return null;
  const parts = String(value).split("-");
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function toISODate(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const timezoneOffset = normalized.getTimezoneOffset() * 60000;
  return new Date(normalized.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function addDays(base, days) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(value) {
  const parsed = normalizeDate(value);
  if (!parsed) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PY", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
}

function getBucket(value, now) {
  const nextDate = normalizeDate(value);
  if (!nextDate) return "sinFecha";

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = addDays(today, 1);
  const weekLimit = addDays(today, 7);

  if (nextDate < today) return "atrasados";
  if (isSameDay(nextDate, today)) return "hoy";
  if (isSameDay(nextDate, tomorrow)) return "manana";
  if (nextDate <= weekLimit) return "semana";
  return "semana";
}

const BUCKETS = [
  {
    key: "hoy",
    title: "Hoy",
    ring: "ring-rose-300",
    badgeClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  },
  {
    key: "atrasados",
    title: "Atrasados",
    ring: "ring-orange-300",
    badgeClass: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  },
  {
    key: "manana",
    title: "Manana",
    ring: "ring-amber-300",
    badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  {
    key: "semana",
    title: "Esta semana",
    ring: "ring-sky-300",
    badgeClass: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  },
  {
    key: "sinFecha",
    title: "Sin fecha",
    ring: "ring-slate-300",
    badgeClass: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  },
];

function sortByFollowUp(a, b) {
  const dateA = normalizeDate(a.fechaProximoContacto);
  const dateB = normalizeDate(b.fechaProximoContacto);
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;
  return dateA - dateB;
}

function getWhatsappUrl(client) {
  const phone = String(client.telefono || "").replace(/\D/g, "");
  const baseMessage = `Hola ${client.nombre}, te escribo de Allianz por ${client.propiedadInteres || "la propiedad de interes"}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(baseMessage)}`;
}

export function AdminClientsPage() {
  const [clients, setClients] = useState(() => getClients());
  const [quickOpenId, setQuickOpenId] = useState("");
  const [customDates, setCustomDates] = useState({});

  const grouped = useMemo(() => {
    const now = new Date();
    const buckets = {
      hoy: [],
      atrasados: [],
      manana: [],
      semana: [],
      sinFecha: [],
    };
    clients.forEach((client) => {
      const bucket = getBucket(client.fechaProximoContacto, now);
      buckets[bucket].push(client);
    });
    Object.keys(buckets).forEach((key) => buckets[key].sort(sortByFollowUp));
    return buckets;
  }, [clients]);

  const updateClientDates = (clientId, nextDate) => {
    const todayISO = toISODate(new Date());
    const nextISO = nextDate ? toISODate(nextDate) : "";
    const updated = clients.map((client) =>
      client.id === clientId
        ? {
            ...client,
            fechaUltimoContacto: todayISO,
            fechaProximoContacto: nextISO,
          }
        : client
    );
    setClients(updated);
    saveClients(updated);
  };

  const openWhatsapp = (client) => {
    window.open(getWhatsappUrl(client), "_blank", "noopener,noreferrer");
    setQuickOpenId(client.id);
    setCustomDates((prev) => ({
      ...prev,
      [client.id]: client.fechaProximoContacto || toISODate(addDays(new Date(), 2)),
    }));
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Seguimiento comercial</p>
          <h1 className="font-display text-5xl leading-none text-ink">Clientes</h1>
          <p className="mt-2 text-sm text-slate">
            Herramienta diaria para identificar a quien contactar y no perder oportunidades.
          </p>
        </div>
        <AppButton to={ROUTES.adminClientNew}>Nuevo cliente</AppButton>
      </header>

      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {BUCKETS.map((bucket) => (
          <article key={bucket.key} className="admin-card p-4">
            <p className="text-xs uppercase tracking-editorial text-slate">{bucket.title}</p>
            <p className="mt-2 font-display text-4xl leading-none text-ink">
              {grouped[bucket.key].length}
            </p>
          </article>
        ))}
      </div>

      <div className="space-y-5">
        {BUCKETS.map((bucket) => (
          <section key={bucket.key} className="space-y-3">
            <header className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-ink">{bucket.title}</h2>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${bucket.badgeClass}`}>
                {grouped[bucket.key].length}
              </span>
            </header>

            {grouped[bucket.key].length === 0 ? (
              <article className="border-fine bg-paper px-4 py-4 text-sm text-slate">
                No hay clientes en esta categoria.
              </article>
            ) : (
              <div className="grid gap-3">
                {grouped[bucket.key].map((client) => (
                  <article
                    key={client.id}
                    className={`rounded-sm border bg-paper p-4 shadow-[0_12px_30px_-26px_rgba(7,26,45,0.45)] ring-1 ${bucket.ring}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{client.nombre}</p>
                        <p className="text-xs uppercase tracking-editorial text-slate">{toTitle(client.estado)}</p>
                        <p className="mt-1 text-sm text-slate">{client.propiedadInteres || "Sin propiedad definida"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-editorial text-slate">Proximo contacto</p>
                        <p className="font-display text-2xl leading-none text-ink">
                          {formatDate(client.fechaProximoContacto)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-slate sm:grid-cols-2">
                      <p>Ultimo contacto: {formatDate(client.fechaUltimoContacto)}</p>
                      <p className="sm:text-right">Telefono: {client.telefono || "-"}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openWhatsapp(client)}
                        className="inline-flex items-center justify-center gap-1.5 border border-[#041B2C] bg-[#041B2C] px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-white transition hover:bg-[#163649]"
                      >
                        WhatsApp
                      </button>
                      <Link
                        to={`/admin/clientes/${client.id}/editar`}
                        className="inline-flex items-center justify-center gap-1.5 border border-stone bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:border-ink"
                      >
                        Editar
                      </Link>
                    </div>

                    <AnimatePresence initial={false}>
                      {quickOpenId === client.id ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 border-t border-stone pt-3">
                            <p className="text-xs uppercase tracking-editorial text-slate">
                              Actualizar proximo contacto
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => updateClientDates(client.id, addDays(new Date(), 2))}
                                className="inline-flex border border-stone bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:border-ink"
                              >
                                +2 dias
                              </button>
                              <button
                                type="button"
                                onClick={() => updateClientDates(client.id, addDays(new Date(), 7))}
                                className="inline-flex border border-stone bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:border-ink"
                              >
                                +7 dias
                              </button>
                              <input
                                type="date"
                                value={customDates[client.id] || ""}
                                onChange={(event) =>
                                  setCustomDates((prev) => ({ ...prev, [client.id]: event.target.value }))
                                }
                                className="border border-stone bg-white px-3 py-2 text-xs text-ink outline-none focus:border-ink"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const value = customDates[client.id];
                                  if (!value) return;
                                  updateClientDates(client.id, normalizeDate(value));
                                }}
                                className="inline-flex border border-[#041B2C] bg-[#041B2C] px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-white transition hover:bg-[#163649]"
                              >
                                Guardar fecha
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}

