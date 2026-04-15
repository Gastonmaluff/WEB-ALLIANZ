import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { getProperties } from "../../content/propertiesContent";
import {
  buildPropertyWhatsappUrl,
  formatCurrency,
  formatOperationLabel,
} from "../../utils/format";
import { ROUTES } from "../../router/paths";
import { AppButton } from "../../components/common/AppButton";
import { ImageSlider } from "../../components/common/ImageSlider";
import { LotBoundaryPublicOverlay } from "../../components/public/LotBoundaryPublicOverlay";

function getPublicStatusBadge(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "disponible") {
    return { label: "Disponible", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" };
  }
  if (normalized === "reservado") {
    return { label: "Reservado", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" };
  }
  if (normalized === "vendido") {
    return { label: "Vendido", className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200" };
  }
  if (normalized === "alquilado") {
    return { label: "Alquilado", className: "bg-[#EAF0F4] text-[#3F5E72] ring-1 ring-[#C8D6E0]" };
  }
  return { label: status || "Sin estado", className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200" };
}

export function PropertyDetailPage() {
  const { slug } = useParams();
  const property = getProperties().find((item) => item.slug === slug);
  const galleryImages = useMemo(() => {
    const fromProperty = [property?.imagenPrincipal, ...(property?.imagenes || [])];
    return [...new Set(fromProperty.filter(Boolean))];
  }, [property?.imagenPrincipal, property?.imagenes]);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    property?.ubicacion || ""
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const whatsappUrl = buildPropertyWhatsappUrl(property);
  const extraFeatures = (property?.caracteristicasExtras || []).filter(
    (item) => item?.label && String(item.label).trim() && item?.value !== undefined && item?.value !== null && String(item.value).trim()
  );
  const lotBoundary = property?.lotOverlay || property?.loteDelimitacion || {};
  const lotBoundaryImageUrl = lotBoundary?.imageUrl || property?.imagenPrincipal || "";
  const hasLotBoundaryPoints = (lotBoundary?.points || []).length > 2;
  const lotBoundaryEnabled = lotBoundary?.enabled === undefined ? hasLotBoundaryPoints : Boolean(lotBoundary?.enabled);
  const useLotBoundaryAsCover = lotBoundaryEnabled && lotBoundaryImageUrl && hasLotBoundaryPoints;
  const secondaryGalleryImages = useMemo(() => {
    const propertyImages = [property?.imagenPrincipal, ...(property?.imagenes || [])];
    const uniquePropertyImages = [...new Set(propertyImages.filter(Boolean))];
    if (!useLotBoundaryAsCover) {
      return uniquePropertyImages.slice(1);
    }
    return uniquePropertyImages.filter((image) => image !== lotBoundaryImageUrl);
  }, [property?.imagenPrincipal, property?.imagenes, lotBoundaryImageUrl, useLotBoundaryAsCover]);
  const status = getPublicStatusBadge(property?.estado);
  const bedrooms = Number(property?.dormitorios || 0);
  const baths = Number(property?.banos || 0);
  const garages = Number(property?.cochera || 0);

  if (!property) {
    return (
      <section className="section-wrap pt-32">
        <div className="container max-w-3xl border-fine bg-paper p-10 text-center">
          <h1 className="mb-4 font-display text-5xl">Propiedad no encontrada</h1>
          <p className="mb-8 text-slate">
            La propiedad que buscabas no esta disponible o fue removida.
          </p>
          <AppButton to={ROUTES.properties}>Volver al catalogo</AppButton>
        </div>
      </section>
    );
  }

  return (
    <section className="section-wrap pt-32">
      <div className="container space-y-8">
        <div className="space-y-3">
          <Link to={ROUTES.properties} className="text-xs uppercase tracking-editorial text-slate">
            Volver a propiedades
          </Link>
          <h1 className="font-display text-6xl leading-none text-ink md:text-7xl">{property.titulo}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-editorial text-slate">
            <span className="border border-stone px-3 py-1">{formatOperationLabel(property.tipoOperacion)}</span>
            <span className="border border-stone px-3 py-1">{property.tipoPropiedad}</span>
            <span>{property.ubicacion}</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {useLotBoundaryAsCover ? (
            <LotBoundaryPublicOverlay
              overlay={{
                ...lotBoundary,
                imageUrl: lotBoundaryImageUrl,
                animate: true,
                labelTitle: lotBoundary?.labelTitle || property?.titulo || "Lote",
                labelSubtitle: lotBoundary?.labelSubtitle || (property?.superficie ? `${property.superficie} m2` : ""),
              }}
              className="h-[420px] border-fine lg:col-span-2 lg:h-[560px]"
              trigger="mount"
              animateOnView={false}
              animateOnce={false}
              replayIntervalMs={7000}
            />
          ) : (
            <ImageSlider
              images={galleryImages}
              altPrefix={`Galeria ${property.titulo}`}
              tone="light"
              autoPlayMs={0}
              showArrows={galleryImages.length > 1}
              showIndicators={galleryImages.length > 1}
              containerClassName="h-[420px] border-fine lg:col-span-2 lg:h-[560px]"
            />
          )}
          <div className="space-y-4 border-fine bg-paper p-6">
            {property.consultarPrecio ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center border border-ink px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-paper"
              >
                Consultar precio
              </a>
            ) : (
              <p className="font-display text-5xl leading-none">
                {formatCurrency(property.precio, property.moneda)}
              </p>
            )}
            <p className="text-sm text-slate">{property.descripcionCorta}</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate">
              <p>Superficie: {property.superficie} m2</p>
              {bedrooms > 0 ? <p>Dormitorios: {bedrooms}</p> : null}
              {baths > 0 ? <p>Banos: {baths}</p> : null}
              {garages > 0 ? <p>Cochera: {garages}</p> : null}
              {extraFeatures.map((item, index) => (
                <p key={`${item.label}-${index}`} className="col-span-2">
                  {item.label}: {item.value}
                </p>
              ))}
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-editorial text-slate">Estado</p>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            <div className="grid gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center bg-[#041B2C] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#163649]"
              >
                WhatsApp
              </a>
              <AppButton to={ROUTES.contact} className="w-full" variant="ghost">
                Coordinar visita
              </AppButton>
            </div>
          </div>
        </div>

        {secondaryGalleryImages.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {secondaryGalleryImages.map((image, index) => (
              <img
                key={`${property.id}-gallery-${index}`}
                src={image}
                alt={`${property.titulo} galeria ${index + 1}`}
                className="h-64 w-full border-fine object-cover"
              />
            ))}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="border-fine bg-paper p-6">
            <h2 className="mb-4 font-display text-4xl">Descripcion</h2>
            <p className="leading-relaxed text-slate">{property.descripcionLarga}</p>
          </article>
          <article className="border-fine bg-paper p-6">
            <h2 className="mb-4 font-display text-4xl">Ubicacion</h2>
            <p className="mb-5 text-slate">{property.ubicacion}</p>
            <iframe
              src={mapEmbedUrl}
              title={`Mapa de ${property.titulo}`}
              className="mb-4 h-64 w-full border border-stone"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={property.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex border border-ink px-4 py-2 text-xs uppercase tracking-editorial text-ink transition hover:bg-ink hover:text-paper"
            >
              Abrir Google Maps
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
