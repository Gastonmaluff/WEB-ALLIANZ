import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { buildPropertyWhatsappUrl, formatCurrency } from "../../utils/format";
import { ImageSlider } from "../common/ImageSlider";
import { LotBoundaryPublicOverlay } from "./LotBoundaryPublicOverlay";

export function PropertyCard({ property, coverMode = "default" }) {
  const navigate = useNavigate();
  const detailPath = `/propiedades/${property.slug}`;
  const galleryImages = useMemo(() => {
    const fromProperty = [property.imagenPrincipal, ...(property.imagenes || [])];
    return [...new Set(fromProperty.filter(Boolean))];
  }, [property.imagenPrincipal, property.imagenes]);
  const whatsappUrl = buildPropertyWhatsappUrl(property);
  const lotBoundary = property?.lotOverlay || property?.loteDelimitacion || {};
  const lotBoundaryImageUrl = lotBoundary?.imageUrl || property?.imagenPrincipal || "";
  const lotBoundaryEnabled =
    lotBoundary?.enabled === undefined
      ? Boolean(lotBoundaryImageUrl && (lotBoundary?.points || []).length > 2)
      : Boolean(lotBoundary?.enabled);
  const hasLotBoundary = lotBoundaryEnabled && lotBoundaryImageUrl && (lotBoundary?.points || []).length > 2;
  const metrics = useMemo(() => {
    const list = [];
    const bedrooms = Number(property?.dormitorios || 0);
    const baths = Number(property?.banos || 0);
    const garages = Number(property?.cochera || 0);
    if (bedrooms > 0) list.push({ key: "dorm", label: "Dorm", value: bedrooms });
    if (baths > 0) list.push({ key: "banos", label: "Banos", value: baths });
    if (garages > 0) list.push({ key: "cochera", label: "Coch", value: garages });
    list.push({ key: "m2", label: "m2", value: property?.superficie || 0 });
    return list;
  }, [property?.dormitorios, property?.banos, property?.cochera, property?.superficie]);

  const openDetail = () => navigate(detailPath);

  return (
    <article
      className="group border-fine bg-paper transition-shadow hover:shadow-editorial cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail();
        }
      }}
    >
      <div className="relative">
        {coverMode === "lot-overlay" && hasLotBoundary ? (
          <LotBoundaryPublicOverlay
            overlay={{ ...lotBoundary, imageUrl: lotBoundaryImageUrl, animate: true }}
            className="h-72"
            trigger="viewport"
            animateOnView
            animateOnce
            replayIntervalMs={0}
          />
        ) : (
          <ImageSlider
            images={galleryImages}
            altPrefix={property.titulo}
            tone="light"
            autoPlayMs={0}
            showIndicators={galleryImages.length > 1}
            showArrows={galleryImages.length > 1}
            containerClassName="h-72"
            controlsClassName="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            indicatorsClassName="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-[1fr_auto] items-start gap-x-7 gap-y-2">
          <h3 className="pr-4 font-display text-3xl leading-none">
            <Link
              to={detailPath}
              onClick={(event) => event.stopPropagation()}
              className="hover:underline decoration-1 underline-offset-4"
            >
              {property.titulo}
            </Link>
          </h3>
          {property.consultarPrecio ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="min-w-[130px] border border-ink px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:bg-ink hover:text-paper"
            >
              Consultar precio
            </a>
          ) : (
            <p className="min-w-[130px] pt-1 text-right text-sm font-semibold tracking-[0.08em] text-ink">
              {formatCurrency(property.precio, property.moneda)}
            </p>
          )}
          <p className="col-span-2 text-sm text-slate">{property.ubicacion}</p>
        </div>

        <p className="line-clamp-2 text-sm text-slate">{property.descripcionCorta}</p>

        <div
          className="grid border-t border-stone pt-4 text-center text-xs uppercase tracking-[0.08em] text-slate"
          style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
        >
          {metrics.map((metric, index) => (
            <p key={metric.key} className={index > 0 ? "border-l border-stone" : ""}>
              <span className="mb-1 block text-base font-semibold text-ink">{metric.value}</span>
              {metric.label}
            </p>
          ))}
        </div>

        <Link
          to={detailPath}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex text-xs font-semibold uppercase tracking-editorial text-ink underline-offset-4 hover:underline"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
