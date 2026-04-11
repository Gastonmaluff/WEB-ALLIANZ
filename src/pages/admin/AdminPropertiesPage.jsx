import { Link } from "react-router-dom";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { ROUTES } from "../../router/paths";
import { AppButton } from "../../components/common/AppButton";
import { formatCurrency, formatOperationLabel, toTitle } from "../../utils/format";

function getStatusBadge(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "disponible") {
    return {
      label: "Disponible",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    };
  }
  if (normalized === "reservado") {
    return {
      label: "Reservado",
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    };
  }
  if (normalized === "vendido") {
    return {
      label: "Vendido",
      className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    };
  }
  return {
    label: toTitle(normalized),
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };
}

function ActionButton({ to, primary = false, children, external = false }) {
  const className = `inline-flex items-center justify-center gap-1.5 border px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial transition ${
    primary
      ? "border-[#041B2C] bg-[#041B2C] text-white hover:bg-[#163649]"
      : "border-stone bg-white text-ink hover:border-ink"
  }`;

  if (external) {
    return (
      <a href={to} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

export function AdminPropertiesPage() {
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Gestion de catalogo</p>
          <h1 className="font-display text-5xl leading-none text-ink">Propiedades</h1>
          <p className="mt-2 text-sm text-slate">
            Administra estado, portada y datos principales de cada propiedad.
          </p>
        </div>
        <AppButton to={ROUTES.adminPropertyNew}>Nueva propiedad</AppButton>
      </header>

      <div className="hidden overflow-hidden border-fine bg-paper lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium">Propiedad</th>
              <th className="px-4 py-3 font-medium">Operacion</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Portada</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PROPERTIES.map((property) => {
              const status = getStatusBadge(property.estado);
              return (
                <tr key={property.id} className="border-b border-stone/70 align-top last:border-b-0">
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={property.imagenPrincipal}
                        alt={property.titulo}
                        className="h-16 w-24 border border-stone object-cover"
                      />
                      <div>
                        <p className="font-semibold text-ink">{property.titulo}</p>
                        <p className="text-xs text-slate">{property.ubicacion}</p>
                        <p className="mt-1 text-xs uppercase tracking-editorial text-slate">
                          {toTitle(property.tipoPropiedad)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">{formatOperationLabel(property.tipoOperacion)}</td>
                  <td className="px-4 py-4">
                    {property.consultarPrecio
                      ? "Consultar precio"
                      : formatCurrency(property.precio, property.moneda)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">{property.destacadaEnPortada ? "Si" : "No"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <ActionButton to={`/admin/propiedades/${property.slug}/editar`} primary>
                        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                          <path d="m14.5 3.5 2 2L8 14H6v-2l8.5-8.5Z" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                        Editar
                      </ActionButton>
                      <ActionButton to={`/propiedades/${property.slug}`}>
                        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                          <path d="M3 10h14M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                        Ver en el sitio
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {MOCK_PROPERTIES.map((property) => {
          const status = getStatusBadge(property.estado);
          return (
            <article key={`mobile-${property.id}`} className="admin-card p-4">
              <div className="flex gap-3">
                <img
                  src={property.imagenPrincipal}
                  alt={property.titulo}
                  className="h-20 w-24 border border-stone object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{property.titulo}</p>
                  <p className="truncate text-xs text-slate">{property.ubicacion}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-editorial">
                    <span className="text-slate">{formatOperationLabel(property.tipoOperacion)}</span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {property.consultarPrecio
                      ? "Consultar precio"
                      : formatCurrency(property.precio, property.moneda)}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-stone pt-3">
                <p className="mb-3 text-[11px] uppercase tracking-editorial text-slate">
                  {property.destacadaEnPortada ? "En portada" : "Sin portada"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton to={`/admin/propiedades/${property.slug}/editar`} primary>
                    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                      <path d="m14.5 3.5 2 2L8 14H6v-2l8.5-8.5Z" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                    Editar
                  </ActionButton>
                  <ActionButton to={`/propiedades/${property.slug}`}>
                    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                      <path d="M3 10h14M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                    Ver en el sitio
                  </ActionButton>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

