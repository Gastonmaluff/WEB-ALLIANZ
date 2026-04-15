import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppButton } from "../../components/common/AppButton";
import {
  getClients,
  registerClientManagement,
  updateClientNextContact,
} from "../../content/clientsContent";
import { MANAGEMENT_RESULTS } from "../../models/clientModel";
import { ROUTES } from "../../router/paths";
import { toTitle } from "../../utils/format";
import { useAuthSession } from "../../hooks/useAuthSession";

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
  return new Intl.DateTimeFormat("es-PY", { day: "2-digit", month: "2-digit" }).format(parsed);
}

function formatDateLong(value) {
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

function formatRelativeTime(value) {
  if (!value) return "sin registro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sin registro";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "hace instantes";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `hace ${diffDays} d`;
  return new Intl.DateTimeFormat("es-PY", { day: "2-digit", month: "2-digit" }).format(date);
}

const BUCKETS = [
  {
    key: "hoy",
    title: "Hoy",
    rowAccent: "border-l-4 border-l-rose-500",
    badgeClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  },
  {
    key: "atrasados",
    title: "Atrasados",
    rowAccent: "border-l-4 border-l-orange-500",
    badgeClass: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  },
  {
    key: "manana",
    title: "Manana",
    rowAccent: "border-l-4 border-l-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  {
    key: "semana",
    title: "Esta semana",
    rowAccent: "border-l-4 border-l-sky-500",
    badgeClass: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  },
  {
    key: "sinFecha",
    title: "Sin fecha",
    rowAccent: "border-l-4 border-l-slate-400",
    badgeClass: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  },
];

function getRowStatusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "interesado") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (value.includes("visita")) return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  if (value.includes("negoci")) return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
  if (value === "cerrado") return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export function AdminClientsPage() {
  const [clients, setClients] = useState(() => getClients());
  const [quickOpenId, setQuickOpenId] = useState("");
  const [customDates, setCustomDates] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [managementForm, setManagementForm] = useState({
    resultado: MANAGEMENT_RESULTS[0],
    nota: "",
    fechaProximoContacto: "",
  });
  const { user } = useAuthSession();

  const selectedClient = useMemo(
    () => clients.find((item) => item.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

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

  const refreshFromStorage = () => {
    setClients(getClients());
  };

  const updateNextDateQuick = (clientId, dateValue) => {
    updateClientNextContact(clientId, dateValue);
    refreshFromStorage();
  };

  const openWhatsapp = (client) => {
    window.open(getWhatsappUrl(client), "_blank", "noopener,noreferrer");
    setQuickOpenId(client.id);
    setCustomDates((prev) => ({
      ...prev,
      [client.id]: client.fechaProximoContacto || toISODate(addDays(new Date(), 2)),
    }));
  };

  const openManagementModal = (client) => {
    setSelectedClientId(client.id);
    setManagementForm({
      resultado: MANAGEMENT_RESULTS[0],
      nota: "",
      fechaProximoContacto: client.fechaProximoContacto || toISODate(addDays(new Date(), 2)),
    });
    setModalOpen(true);
  };

  const submitManagement = (event) => {
    event.preventDefault();
    if (!selectedClient) return;
    registerClientManagement({
      clientId: selectedClient.id,
      usuario: user?.displayName || user?.email || "Administrador Allianz",
      resultado: managementForm.resultado,
      nota: managementForm.nota,
      fechaProximoContacto: managementForm.fechaProximoContacto,
    });
    refreshFromStorage();
    setModalOpen(false);
    setSelectedClientId("");
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Seguimiento comercial</p>
          <h1 className="font-display text-5xl leading-none text-ink">Clientes</h1>
          <p className="mt-1.5 text-sm text-slate">
            Vista diaria para priorizar follow-up y coordinar gestiones entre vendedores.
          </p>
        </div>
        <AppButton to={ROUTES.adminClientNew}>Nuevo cliente</AppButton>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {BUCKETS.map((bucket) => (
          <article key={bucket.key} className="admin-card p-3.5">
            <p className="text-[11px] uppercase tracking-editorial text-slate">{bucket.title}</p>
            <p className="mt-1.5 font-display text-3xl leading-none text-ink">{grouped[bucket.key].length}</p>
          </article>
        ))}
      </div>

      <div className="space-y-5">
        {BUCKETS.map((bucket) => (
          <section key={bucket.key} className="space-y-2">
            <header className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-ink">{bucket.title}</h2>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${bucket.badgeClass}`}>
                {grouped[bucket.key].length}
              </span>
            </header>

            {grouped[bucket.key].length === 0 ? (
              <article className="border-fine bg-paper px-4 py-3 text-sm text-slate">
                No hay clientes en esta categoria.
              </article>
            ) : (
              <div className="overflow-hidden border-fine bg-paper">
                <div className="hidden grid-cols-[1.2fr_0.9fr_1.2fr_0.8fr_0.8fr_auto] items-center gap-3 border-b border-stone bg-surface px-4 py-2 text-[11px] font-semibold uppercase tracking-editorial text-slate lg:grid">
                  <span>Nombre</span>
                  <span>Estado</span>
                  <span>Propiedad</span>
                  <span>Ult. contacto</span>
                  <span>Prox. fecha</span>
                  <span className="text-right">Acciones</span>
                </div>

                <div className="divide-y divide-stone/80">
                  {grouped[bucket.key].map((client) => {
                    const lastManagement = client.gestiones?.[0];
                    return (
                      <div key={client.id}>
                        <article
                          className={`grid gap-3 px-4 py-3 text-sm lg:grid-cols-[1.2fr_0.9fr_1.2fr_0.8fr_0.8fr_auto] lg:items-center ${bucket.rowAccent}`}
                        >
                          <div>
                            <p className="font-semibold text-ink">{client.nombre}</p>
                            <p className="text-[11px] text-slate">
                              Ultima gestion: {lastManagement?.usuario || "Sin gestionar"} - {formatRelativeTime(lastManagement?.fecha)}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${getRowStatusClass(client.estado)}`}
                            >
                              {toTitle(client.estado)}
                            </span>
                          </div>

                          <p className="text-slate">{client.propiedadInteres || "Sin propiedad definida"}</p>
                          <p className="text-slate">{formatDate(client.fechaUltimoContacto)}</p>
                          <p className="font-semibold text-ink">{formatDateLong(client.fechaProximoContacto)}</p>

                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openWhatsapp(client)}
                              className="inline-flex items-center justify-center border border-[#041B2C] bg-[#041B2C] px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-white transition hover:bg-[#163649]"
                            >
                              WhatsApp
                            </button>
                            <button
                              type="button"
                              onClick={() => openManagementModal(client)}
                              className="inline-flex items-center justify-center border border-stone bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:border-ink"
                            >
                              Registrar gestion
                            </button>
                            <Link
                              to={`/admin/clientes/${client.id}/editar`}
                              className="inline-flex items-center justify-center border border-stone bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:border-ink"
                            >
                              Editar
                            </Link>
                          </div>
                        </article>

                        <AnimatePresence initial={false}>
                          {quickOpenId === client.id ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden border-t border-dashed border-stone/80 bg-[#F9FBFC] px-4"
                            >
                              <div className="flex flex-wrap items-center gap-2 py-3">
                                <p className="text-xs uppercase tracking-editorial text-slate">
                                  Proximo contacto rapido:
                                </p>
                                <button
                                  type="button"
                                  onClick={() => updateNextDateQuick(client.id, addDays(new Date(), 2))}
                                  className="border border-stone bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:border-ink"
                                >
                                  +2 dias
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateNextDateQuick(client.id, addDays(new Date(), 7))}
                                  className="border border-stone bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:border-ink"
                                >
                                  +7 dias
                                </button>
                                <input
                                  type="date"
                                  value={customDates[client.id] || ""}
                                  onChange={(event) =>
                                    setCustomDates((prev) => ({ ...prev, [client.id]: event.target.value }))
                                  }
                                  className="border border-stone bg-white px-3 py-1.5 text-xs text-ink outline-none focus:border-ink"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const value = customDates[client.id];
                                    if (!value) return;
                                    const parsed = normalizeDate(value);
                                    if (!parsed) return;
                                    updateNextDateQuick(client.id, parsed);
                                  }}
                                  className="border border-[#041B2C] bg-[#041B2C] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-editorial text-white transition hover:bg-[#163649]"
                                >
                                  Guardar
                                </button>
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && selectedClient ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020A16]/50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={submitManagement}
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl border-fine bg-paper p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-editorial text-slate">Registrar gestion</p>
                  <h3 className="font-display text-4xl leading-none text-ink">{selectedClient.nombre}</h3>
                  <p className="mt-1 text-sm text-slate">{selectedClient.propiedadInteres}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-stone px-2 py-1 text-xs uppercase tracking-editorial text-ink"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Resultado</span>
                  <select
                    value={managementForm.resultado}
                    onChange={(event) =>
                      setManagementForm((prev) => ({ ...prev, resultado: event.target.value }))
                    }
                    className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                  >
                    {MANAGEMENT_RESULTS.map((item) => (
                      <option key={item} value={item}>
                        {toTitle(item)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Notas</span>
                  <textarea
                    rows={3}
                    value={managementForm.nota}
                    onChange={(event) =>
                      setManagementForm((prev) => ({ ...prev, nota: event.target.value }))
                    }
                    className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                    placeholder="Resumen breve de la gestion realizada..."
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-editorial text-slate">
                    Proximo contacto
                  </span>
                  <input
                    type="date"
                    value={managementForm.fechaProximoContacto}
                    onChange={(event) =>
                      setManagementForm((prev) => ({ ...prev, fechaProximoContacto: event.target.value }))
                    }
                    className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                </label>
              </div>

              <div className="mt-4 border-t border-stone pt-3">
                <p className="text-xs font-semibold uppercase tracking-editorial text-slate">
                  Historial reciente
                </p>
                {selectedClient.gestiones?.length ? (
                  <ul className="mt-2 space-y-2">
                    {selectedClient.gestiones.slice(0, 4).map((item) => (
                      <li key={item.id} className="border border-stone bg-surface px-3 py-2 text-xs text-slate">
                        <p className="font-semibold text-ink">
                          {item.usuario} - {formatRelativeTime(item.fecha)}
                        </p>
                        <p className="uppercase tracking-editorial">{toTitle(item.resultado)}</p>
                        {item.nota ? <p className="mt-1">{item.nota}</p> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-slate">Sin gestiones registradas.</p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <AppButton type="submit">Guardar gestion</AppButton>
                <AppButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancelar
                </AppButton>
              </div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
