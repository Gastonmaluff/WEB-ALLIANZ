import { Link } from "react-router-dom";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { ROUTES } from "../../router/paths";
import { AppButton } from "../../components/common/AppButton";
import { formatCurrency } from "../../utils/format";

export function AdminPropertiesPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">CRUD</p>
          <h1 className="font-display text-5xl">Propiedades</h1>
        </div>
        <AppButton to={ROUTES.adminPropertyNew}>Nueva propiedad</AppButton>
      </div>

      <div className="overflow-x-auto border-fine bg-paper">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium">Titulo</th>
              <th className="px-4 py-3 font-medium">Operacion</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Destacada</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PROPERTIES.map((property) => (
              <tr key={property.id} className="border-b border-stone/70 last:border-b-0">
                <td className="px-4 py-4">{property.titulo}</td>
                <td className="px-4 py-4 capitalize">{property.tipoOperacion}</td>
                <td className="px-4 py-4">{formatCurrency(property.precio, property.moneda)}</td>
                <td className="px-4 py-4 capitalize">{property.estado}</td>
                <td className="px-4 py-4">{property.destacadaEnPortada ? "Si" : "No"}</td>
                <td className="px-4 py-4">
                  <Link
                    to={`/admin/propiedades/${property.slug}/editar`}
                    className="text-xs font-semibold uppercase tracking-editorial text-ink underline-offset-4 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
