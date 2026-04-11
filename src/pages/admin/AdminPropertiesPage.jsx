import { Link } from "react-router-dom";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { ROUTES } from "../../router/paths";
import { AppButton } from "../../components/common/AppButton";
import { formatCurrency, formatOperationLabel, toTitle } from "../../utils/format";

export function AdminPropertiesPage() {
  return (
    <section className="space-y-6">
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
            {MOCK_PROPERTIES.map((property) => (
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
                <td className="px-4 py-4 capitalize">{property.estado}</td>
                <td className="px-4 py-4">{property.destacadaEnPortada ? "Si" : "No"}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-3 text-xs uppercase tracking-editorial">
                    <Link to={`/admin/propiedades/${property.slug}/editar`} className="text-ink hover:underline">
                      Editar
                    </Link>
                    <Link to={`/propiedades/${property.slug}`} className="text-slate hover:underline">
                      Ver sitio
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {MOCK_PROPERTIES.map((property) => (
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
                <p className="mt-2 text-xs uppercase tracking-editorial text-slate">
                  {formatOperationLabel(property.tipoOperacion)} · {toTitle(property.estado)}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {property.consultarPrecio
                    ? "Consultar precio"
                    : formatCurrency(property.precio, property.moneda)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-stone pt-3 text-xs uppercase tracking-editorial">
              <span className="text-slate">
                {property.destacadaEnPortada ? "En portada" : "Sin portada"}
              </span>
              <Link to={`/admin/propiedades/${property.slug}/editar`} className="text-ink hover:underline">
                Editar
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
