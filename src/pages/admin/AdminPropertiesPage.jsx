import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProperties, removeProperty, subscribeProperties } from "../../content/propertiesContent";
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
  if (normalized === "alquilado") {
    return {
      label: "Alquilado",
      className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    };
  }
  return {
    label: toTitle(normalized),
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };
}

function getPublicDetailUrl(slug) {
  if (typeof window === "undefined") return `/propiedades/${slug}`;
  const basePath = import.meta.env.BASE_URL || "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return new URL(`${normalizedBase}propiedades/${slug}`, window.location.origin).toString();
}

function MenuItem({ onClick, danger = false, disabled = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-editorial transition ${
        danger
          ? "text-[#6F3F45] hover:bg-[#F8F3F4]"
          : "text-ink hover:bg-surface"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

function PropertyActionsMenu({
  property,
  onDelete,
  onExportPdf,
  isDeleting = false,
  isExporting = false,
  compact = false,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const publicUrl = useMemo(() => getPublicDetailUrl(property.slug), [property.slug]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const buttonSize = compact ? "h-8 w-8" : "h-9 w-9";
  const menuWidth = compact ? "w-44" : "w-48";

  const handleEdit = () => {
    setOpen(false);
    navigate(`/admin/propiedades/${property.slug}/editar`);
  };

  const handleDelete = async () => {
    setOpen(false);
    await onDelete();
  };

  const handleExport = async () => {
    setOpen(false);
    await onExportPdf();
  };

  const handleViewSite = () => {
    setOpen(false);
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={menuRef} className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Abrir acciones"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex ${buttonSize} items-center justify-center border border-stone bg-white text-ink transition hover:border-[#163649]`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M12 5.5a1.2 1.2 0 1 0 0 .01V5.5Zm0 5.3a1.2 1.2 0 1 0 0 .01v-.01Zm0 5.3a1.2 1.2 0 1 0 0 .01v-.01Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          className={`absolute right-0 top-[calc(100%+8px)] z-30 ${menuWidth} overflow-hidden border border-stone bg-paper shadow-[0_14px_34px_rgba(4,27,44,0.14)]`}
        >
          <MenuItem onClick={handleEdit}>
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path d="m14.5 3.5 2 2L8 14H6v-2l8.5-8.5Z" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Editar
          </MenuItem>
          <MenuItem onClick={handleDelete} danger disabled={isDeleting}>
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path d="M5 6h10M8 6V4h4v2m-5 0v9m3-9v9m3-9v9" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </MenuItem>
          <MenuItem onClick={handleExport} disabled={isExporting}>
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path
                d="M10 3v8m0 0 3-3m-3 3-3-3M4 13v2h12v-2"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isExporting ? "Exportando..." : "Exportar PDF"}
          </MenuItem>
          <MenuItem onClick={handleViewSite}>
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path d="M3 10h14M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Ver en web
          </MenuItem>
        </div>
      ) : null}
    </div>
  );
}

export function AdminPropertiesPage() {
  const [properties, setProperties] = useState(() => getProperties());
  const [feedback, setFeedback] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [exportingId, setExportingId] = useState("");

  useEffect(() => {
    return subscribeProperties((items) => setProperties(items));
  }, []);

  const handleDeleteProperty = async (property) => {
    const confirmed = window.confirm("Seguro que queres eliminar esta propiedad?");
    if (!confirmed) return;

    setDeletingId(property.id);
    setFeedback(null);

    const result = await removeProperty(property.id);
    setDeletingId("");

    if (!result.ok) {
      const suffix =
        result.reason === "has_relations"
          ? " Elimina o reasigna esas ventas desde el modulo Ventas antes de continuar."
          : "";
      setFeedback({
        type: "error",
        message: `${result.message}${suffix}`,
      });
      return;
    }

    setFeedback({
      type: result.synced === false ? "warning" : "success",
      message: result.message,
    });
  };

  const handleExportPropertyPdf = async (property) => {
    setExportingId(property.id);
    setFeedback(null);
    try {
      const { exportPropertyBrochurePdf } = await import("../../utils/propertyBrochurePdf");
      await exportPropertyBrochurePdf(property);
      setFeedback({
        type: "success",
        message: `Ficha PDF generada para ${property.titulo}.`,
      });
    } catch {
      setFeedback({
        type: "error",
        message:
          "No se pudo generar el PDF de esta propiedad. Verifica imagenes y vuelve a intentar.",
      });
    } finally {
      setExportingId("");
    }
  };

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

      {feedback ? (
        <div
          className={`border px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "border-[#D8C4C7] bg-[#F8F3F4] text-[#6F3F45]"
              : feedback.type === "warning"
              ? "border-[#D6C8A8] bg-[#F8F4EA] text-[#6A5530]"
              : "border-[#B9D8CA] bg-[#EEF7F2] text-[#2D6249]"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="hidden overflow-x-auto border-fine bg-paper xl:block">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col style={{ width: "48%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead className="border-b border-stone bg-surface">
            <tr>
              <th className="px-3 py-3 font-medium">Propiedad</th>
              <th className="px-3 py-3 font-medium">Operacion</th>
              <th className="px-3 py-3 font-medium">Precio</th>
              <th className="px-3 py-3 font-medium">Estado</th>
              <th className="px-3 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => {
              const status = getStatusBadge(property.estado);
              return (
                <tr key={property.id} className="border-b border-stone/70 align-middle last:border-b-0">
                  <td className="px-3 py-3">
                    <div className="grid grid-cols-[84px_minmax(0,1fr)] items-start gap-2.5">
                      <img
                        src={property.imagenPrincipal}
                        alt={property.titulo}
                        className="h-14 w-[84px] border border-stone object-cover"
                      />
                      <div className="min-w-0">
                        <p className="break-words text-[13px] font-semibold leading-tight text-ink">
                          {property.titulo}
                        </p>
                        <p className="mt-1 break-words text-xs leading-snug text-slate">{property.ubicacion}</p>
                        <p className="mt-1.5 text-[11px] uppercase tracking-editorial text-slate">
                          {toTitle(property.tipoPropiedad)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="break-words text-[13px] leading-snug text-ink">
                      {formatOperationLabel(property.tipoOperacion)}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="break-words text-[13px] leading-snug text-ink">
                      {property.consultarPrecio
                        ? "Consultar precio"
                        : formatCurrency(property.precio, property.moneda)}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <PropertyActionsMenu
                      property={property}
                      isDeleting={deletingId === property.id}
                      isExporting={exportingId === property.id}
                      onDelete={() => handleDeleteProperty(property)}
                      onExportPdf={() => handleExportPropertyPdf(property)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 xl:hidden">
        {properties.map((property) => {
          const status = getStatusBadge(property.estado);
          return (
            <article key={`mobile-${property.id}`} className="admin-card p-4">
              <div className="flex items-start gap-3">
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
                <PropertyActionsMenu
                  property={property}
                  compact
                  isDeleting={deletingId === property.id}
                  isExporting={exportingId === property.id}
                  onDelete={() => handleDeleteProperty(property)}
                  onExportPdf={() => handleExportPropertyPdf(property)}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
