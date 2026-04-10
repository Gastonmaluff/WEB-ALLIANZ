import { Link } from "react-router-dom";
import { MetricCard } from "../../components/admin/MetricCard";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { MOCK_TESTIMONIALS } from "../../mocks/testimonials";
import { ROUTES } from "../../router/paths";

const iconBuilding = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M4 21V5h16v16M9 21v-4h6v4M8 9h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const iconCheck = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const iconStar = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path
      d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const iconKey = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M14 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM10 11l8 8m-2-2 2-2m-4 0 2-2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export function AdminDashboardPage() {
  const total = MOCK_PROPERTIES.length;
  const available = MOCK_PROPERTIES.filter((item) => item.estado === "disponible").length;
  const featured = MOCK_PROPERTIES.filter((item) => item.destacadaEnPortada).length;
  const rents = MOCK_PROPERTIES.filter((item) => item.tipoOperacion === "alquiler").length;

  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-editorial text-slate">Panel privado</p>
        <h1 className="font-display text-5xl leading-none text-ink">Resumen general</h1>
        <p className="max-w-2xl text-sm text-slate">
          Vista general de la actividad del catalogo y accesos rapidos para gestion operativa.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MetricCard title="Total propiedades" value={total} icon={iconBuilding} hint="Stock general cargado en sistema" />
        <MetricCard title="Disponibles" value={available} icon={iconCheck} accent="ink" hint="Publicables en el sitio" />
        <MetricCard title="En portada" value={featured} icon={iconStar} hint="Destacadas en home publica" />
        <MetricCard title="Alquileres" value={rents} icon={iconKey} accent="slate" hint="Propiedades en renta" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="admin-card">
          <h2 className="mb-4 font-display text-3xl leading-none">Accesos rapidos</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to={ROUTES.adminPropertyNew}
              className="border border-stone bg-surface p-4 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Crear</p>
              <p className="mt-2 font-semibold text-ink">Nueva propiedad</p>
            </Link>
            <Link
              to={ROUTES.adminProperties}
              className="border border-stone bg-surface p-4 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Gestion</p>
              <p className="mt-2 font-semibold text-ink">Editar propiedades</p>
            </Link>
            <Link
              to={ROUTES.adminTestimonials}
              className="border border-stone bg-surface p-4 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Contenido</p>
              <p className="mt-2 font-semibold text-ink">Gestionar testimonios</p>
            </Link>
            <Link
              to={ROUTES.properties}
              className="border border-stone bg-surface p-4 text-sm transition hover:border-ink"
            >
              <p className="text-xs uppercase tracking-editorial text-slate">Vista publica</p>
              <p className="mt-2 font-semibold text-ink">Revisar catalogo</p>
            </Link>
          </div>
        </article>

        <article className="admin-card">
          <h2 className="mb-4 font-display text-3xl leading-none">Estado rapido</h2>
          <ul className="space-y-3 text-sm text-slate">
            <li className="flex justify-between gap-3 border-b border-stone pb-3">
              <span>Testimonios cargados</span>
              <strong className="text-ink">{MOCK_TESTIMONIALS.length}</strong>
            </li>
            <li className="flex justify-between gap-3 border-b border-stone pb-3">
              <span>Publicaciones nuevas</span>
              <strong className="text-ink">4</strong>
            </li>
            <li className="flex justify-between gap-3">
              <span>Pendientes revision</span>
              <strong className="text-ink">2</strong>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
