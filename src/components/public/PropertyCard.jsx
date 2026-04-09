import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/format";

export function PropertyCard({ property }) {
  return (
    <article className="group border-fine bg-paper">
      <div className="overflow-hidden">
        <img
          src={property.imagenPrincipal}
          alt={property.titulo}
          className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-3xl leading-none">{property.titulo}</h3>
          <p className="text-sm font-semibold tracking-wide text-ink">
            {formatCurrency(property.precio, property.moneda)}
          </p>
        </div>

        <p className="text-sm text-slate">{property.ubicacion}</p>
        <p className="line-clamp-2 text-sm text-slate">{property.descripcionCorta}</p>

        <div className="grid grid-cols-3 border-t border-stone pt-4 text-center text-xs uppercase tracking-[0.08em] text-slate">
          <p>
            <span className="mb-1 block text-base font-semibold text-ink">{property.dormitorios}</span>
            Dorm
          </p>
          <p className="border-x border-stone">
            <span className="mb-1 block text-base font-semibold text-ink">{property.banos}</span>
            Banos
          </p>
          <p>
            <span className="mb-1 block text-base font-semibold text-ink">{property.superficie}</span>
            m2
          </p>
        </div>

        <Link
          to={`/propiedades/${property.slug}`}
          className="inline-flex text-xs font-semibold uppercase tracking-editorial text-ink underline-offset-4 hover:underline"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
