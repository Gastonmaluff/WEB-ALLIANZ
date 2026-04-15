import { Link } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { getSales } from "../../content/salesContent";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { ROUTES } from "../../router/paths";
import { formatCurrency, toTitle } from "../../utils/format";

function getStatusBadge(status) {
  if (status === "cerrada") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "reservada") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (status === "en negociacion") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "cancelada") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-violet-50 text-violet-700 ring-violet-200";
}

function getPropertyLabel(sale, propertyMap) {
  if (sale.origenVenta === "externo") return sale.propertyManual || "Propiedad externa";
  return propertyMap.get(sale.propertyId) || sale.propertyManual || "Propiedad del sistema";
}

function formatShortDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("es-PY", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
}

export function AdminSalesPage() {
  const sales = getSales();
  const propertyMap = new Map(MOCK_PROPERTIES.map((item) => [item.id, item.titulo]));
  const closedCount = sales.filter((sale) => sale.estado === "cerrada").length;
  const activeCount = sales.filter((sale) =>
    ["en negociacion", "reservada", "en documentacion"].includes(sale.estado)
  ).length;

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Gestion comercial</p>
          <h1 className="font-display text-5xl leading-none text-ink">Ventas</h1>
          <p className="mt-2 text-sm text-slate">
            Registro de operaciones con detalle comercial y repositorio documental.
          </p>
        </div>
        <AppButton to={ROUTES.adminSaleNew}>Registrar venta</AppButton>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="admin-card p-4">
          <p className="text-[11px] uppercase tracking-editorial text-slate">Total ventas</p>
          <p className="mt-1 font-display text-3xl text-ink">{sales.length}</p>
        </article>
        <article className="admin-card p-4">
          <p className="text-[11px] uppercase tracking-editorial text-slate">Activas</p>
          <p className="mt-1 font-display text-3xl text-ink">{activeCount}</p>
        </article>
        <article className="admin-card p-4">
          <p className="text-[11px] uppercase tracking-editorial text-slate">Cerradas</p>
          <p className="mt-1 font-display text-3xl text-ink">{closedCount}</p>
        </article>
        <article className="admin-card p-4">
          <p className="text-[11px] uppercase tracking-editorial text-slate">Documentos</p>
          <p className="mt-1 font-display text-3xl text-ink">
            {sales.reduce((acc, sale) => acc + (sale.archivos?.length || 0), 0)}
          </p>
        </article>
      </div>

      <div className="hidden overflow-hidden border-fine bg-paper lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Vendedor</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Inmueble</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Archivos</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-stone/70 align-top last:border-b-0">
                <td className="px-4 py-4">
                  <p className="font-semibold text-ink">{sale.clienteNombre || "Sin cliente"}</p>
                  <p className="text-xs text-slate">{toTitle(sale.tipoInmueble)}</p>
                </td>
                <td className="px-4 py-4">{sale.vendedorResponsable || "Sin asignar"}</td>
                <td className="px-4 py-4">{formatShortDate(sale.fechaVenta)}</td>
                <td className="px-4 py-4">{getPropertyLabel(sale, propertyMap)}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ring-1 ${getStatusBadge(
                      sale.estado
                    )}`}
                  >
                    {toTitle(sale.estado)}
                  </span>
                </td>
                <td className="px-4 py-4">{formatCurrency(sale.precioVenta, sale.moneda)}</td>
                <td className="px-4 py-4">{sale.archivos?.length || 0}</td>
                <td className="px-4 py-4">
                  <Link
                    to={`/admin/ventas/${sale.id}/editar`}
                    className="inline-flex items-center justify-center border border-[#041B2C] bg-[#041B2C] px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-white transition hover:bg-[#163649]"
                  >
                    Editar venta
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {sales.map((sale) => (
          <article key={`mobile-${sale.id}`} className="admin-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">{sale.clienteNombre || "Sin cliente"}</p>
                <p className="text-xs text-slate">{getPropertyLabel(sale, propertyMap)}</p>
              </div>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${getStatusBadge(
                  sale.estado
                )}`}
              >
                {toTitle(sale.estado)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate">
              <p>
                <span className="font-semibold text-ink">Fecha:</span> {formatShortDate(sale.fechaVenta)}
              </p>
              <p>
                <span className="font-semibold text-ink">Vendedor:</span> {sale.vendedorResponsable || "-"}
              </p>
              <p>
                <span className="font-semibold text-ink">Monto:</span>{" "}
                {formatCurrency(sale.precioVenta, sale.moneda)}
              </p>
              <p>
                <span className="font-semibold text-ink">Archivos:</span> {sale.archivos?.length || 0}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={`/admin/ventas/${sale.id}/editar`}
                className="inline-flex items-center justify-center border border-[#041B2C] bg-[#041B2C] px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-white transition hover:bg-[#163649]"
              >
                Editar venta
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
