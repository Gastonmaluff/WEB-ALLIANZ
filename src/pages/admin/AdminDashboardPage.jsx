import { Link } from "react-router-dom";
import { MetricCard } from "../../components/admin/MetricCard";
import { getClients } from "../../content/clientsContent";
import { getSales } from "../../content/salesContent";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { MOCK_TESTIMONIALS } from "../../mocks/testimonials";
import { ROUTES } from "../../router/paths";

const iconBuilding = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M4 21V5h16v16M9 21v-4h6v4M8 9h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const iconAlarm = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M12 7v5l3 2m5-2a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const iconWarning = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M12 9v4m0 4h.01M4.93 19h14.14L12 5 4.93 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const iconBriefcase = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path
      d="M3 8h18v11H3V8Zm5 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

function normalizeDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function AdminDashboardPage() {
  const total = MOCK_PROPERTIES.length;
  const clients = getClients();
  const sales = getSales();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpToday = clients.filter((client) => {
    const nextDate = normalizeDate(client.fechaProximoContacto);
    return nextDate ? isSameDay(nextDate, today) : false;
  }).length;
  const overdue = clients.filter((client) => {
    const nextDate = normalizeDate(client.fechaProximoContacto);
    return nextDate ? nextDate < today : false;
  }).length;
  const closedSales = sales.filter((sale) => sale.estado === "cerrada").length;

  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-xs uppercase tracking-editorial text-slate">Panel privado</p>
        <h1 className="font-display text-5xl leading-none text-ink">Resumen general</h1>
        <p className="max-w-2xl text-sm text-slate">
          Vista operativa del catalogo y del seguimiento comercial diario.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard title="Total propiedades" value={total} icon={iconBuilding} hint="Stock general" />
        <MetricCard title="Follow-up hoy" value={followUpToday} icon={iconAlarm} accent="ink" hint="Contactar hoy" />
        <MetricCard title="Atrasados" value={overdue} icon={iconWarning} hint="Prioridad alta" />
        <MetricCard title="Ventas cerradas" value={closedSales} icon={iconBriefcase} accent="ink" hint="Operaciones concretadas" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="admin-card">
          <h2 className="mb-3 font-display text-3xl leading-none">Accesos rapidos</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Link
              to={ROUTES.adminClients}
              className="border border-stone bg-surface px-4 py-3 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Seguimiento</p>
              <p className="mt-1.5 font-semibold text-ink">Clientes</p>
            </Link>
            <Link
              to={ROUTES.adminCalendar}
              className="border border-stone bg-surface px-4 py-3 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Agenda</p>
              <p className="mt-1.5 font-semibold text-ink">Calendario comercial</p>
            </Link>
            <Link
              to={ROUTES.adminSales}
              className="border border-stone bg-surface px-4 py-3 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Operacion</p>
              <p className="mt-1.5 font-semibold text-ink">Ventas y documentos</p>
            </Link>
            <Link
              to={ROUTES.adminPropertyNew}
              className="border border-stone bg-surface px-4 py-3 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Crear</p>
              <p className="mt-1.5 font-semibold text-ink">Nueva propiedad</p>
            </Link>
            <Link
              to={ROUTES.adminProperties}
              className="border border-stone bg-surface px-4 py-3 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Gestion</p>
              <p className="mt-1.5 font-semibold text-ink">Editar propiedades</p>
            </Link>
            <Link
              to={ROUTES.adminHero}
              className="border border-stone bg-surface px-4 py-3 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Portada</p>
              <p className="mt-1.5 font-semibold text-ink">Editar portada</p>
            </Link>
            <Link
              to={ROUTES.adminTestimonials}
              className="border border-stone bg-surface px-4 py-3 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Contenido</p>
              <p className="mt-1.5 font-semibold text-ink">Testimonios</p>
            </Link>
            <Link
              to={ROUTES.properties}
              className="border border-stone bg-surface px-4 py-3 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Vista publica</p>
              <p className="mt-1.5 font-semibold text-ink">Revisar catalogo</p>
            </Link>
          </div>
        </article>

        <article className="admin-card">
          <h2 className="mb-3 font-display text-3xl leading-none">Estado rapido</h2>
          <ul className="space-y-2.5 text-sm text-slate">
            <li className="flex justify-between gap-3 border-b border-stone pb-2.5">
              <span>Testimonios cargados</span>
              <strong className="text-ink">{MOCK_TESTIMONIALS.length}</strong>
            </li>
            <li className="flex justify-between gap-3 border-b border-stone pb-2.5">
              <span>Clientes totales</span>
              <strong className="text-ink">{clients.length}</strong>
            </li>
            <li className="flex justify-between gap-3 border-b border-stone pb-2.5">
              <span>Ventas cerradas</span>
              <strong className="text-ink">{closedSales}</strong>
            </li>
            <li className="flex justify-between gap-3">
              <span>Seguimientos pendientes</span>
              <strong className="text-ink">{followUpToday + overdue}</strong>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
