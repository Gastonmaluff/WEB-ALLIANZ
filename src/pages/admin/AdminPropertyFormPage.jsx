import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LotBoundaryEditor, LOT_EDITOR_MODE } from "../../components/admin/LotBoundaryEditor";
import { LotBoundaryPreview } from "../../components/admin/LotBoundaryPreview";
import { AppButton } from "../../components/common/AppButton";
import {
  getPropertyBySlug,
  syncPropertiesFromCloud,
  upsertProperty,
} from "../../content/propertiesContent";
import { uploadPropertyImage } from "../../firebase/storage";
import { emptyProperty, OPERATION_TYPES, PROPERTY_STATUS } from "../../models/propertyModel";
import { ROUTES } from "../../router/paths";
import { formatOperationLabel, slugify } from "../../utils/format";
import { normalizePolygonPoints } from "../../utils/polygon";

const propertyTypes = ["Casa", "Departamento", "Lote", "Terreno", "Oficina"];
const currencies = ["USD", "PYG"];
const numberFields = ["precio", "superficie", "dormitorios", "banos", "cochera"];

function uniqueImages(images) {
  return [...new Set(images.filter(Boolean).map((img) => img.trim()))];
}

function normalizeExtraFeatures(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => ({
      id: item?.id || `extra-${Date.now()}-${index}`,
      label: String(item?.label || "").trim(),
      value: String(item?.value || "").trim(),
    }))
    .filter((item) => item.label && item.value);
}

function normalizeLotOverlay(overlay, fallbackTitle = "", legacyBoundary = null) {
  const source = overlay || legacyBoundary || {};
  return {
    imageUrl: String(source?.imageUrl || "").trim(),
    points: normalizePolygonPoints(source?.points || []),
    closed: Boolean(source?.closed),
    strokeColor: String(source?.strokeColor || "#7DD3FC"),
    strokeWidth: Number(source?.strokeWidth || 0.75),
    fillColor: String(source?.fillColor || "#50BEFF"),
    fillOpacity: Number(source?.fillOpacity ?? 0.18),
    animationDuration: Number(source?.animationDuration || 1.35),
    animate: source?.animate !== false,
    animateOnView: source?.animateOnView !== false,
    animateOnce: source?.animateOnce !== false,
    showLabel: source?.showLabel !== false,
    labelTitle: String(source?.labelTitle || source?.label || fallbackTitle || "").trim(),
    labelSubtitle: String(source?.labelSubtitle || "").trim(),
  };
}

function normalizeProperty(foundProperty) {
  if (!foundProperty) {
    return {
      ...emptyProperty,
      publicada: true,
      consultarPrecio: false,
      caracteristicasExtras: [],
      lotOverlay: normalizeLotOverlay(null),
    };
  }

  const principal = foundProperty.imagenPrincipal || "";
  const gallery = uniqueImages([...(foundProperty.imagenes || [])]).filter((img) => img !== principal);

  return {
    ...emptyProperty,
    ...foundProperty,
    imagenPrincipal: principal || gallery[0] || "",
    imagenes: principal ? gallery : gallery.slice(1),
    publicada: foundProperty.publicada ?? true,
    consultarPrecio: foundProperty.consultarPrecio ?? false,
    caracteristicasExtras: normalizeExtraFeatures(foundProperty.caracteristicasExtras),
    lotOverlay: normalizeLotOverlay(
      foundProperty.lotOverlay,
      foundProperty.superficie ? `${foundProperty.superficie} m2` : "",
      foundProperty.loteDelimitacion
    ),
  };
}

function FormSection({ title, description, children }) {
  return (
    <section className="admin-card space-y-3">
      <div>
        <h2 className="font-display text-3xl leading-none text-ink">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-slate">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ label, name, required = false, help, error, children }) {
  return (
    <label htmlFor={name} className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-editorial text-slate">{label}</span>
        {required ? <span className="text-[10px] uppercase tracking-editorial text-[#7A2A2A]">Requerido</span> : null}
      </div>
      {children}
      {help ? <p className="text-xs text-slate">{help}</p> : null}
      {error ? <p className="text-xs text-[#7A2A2A]">{error}</p> : null}
    </label>
  );
}

function validateForm(form) {
  const errors = {};

  if (!form.titulo.trim()) errors.titulo = "Ingresa un titulo.";
  if (!form.tipoOperacion) errors.tipoOperacion = "Selecciona tipo de operacion.";
  if (!form.tipoPropiedad) errors.tipoPropiedad = "Selecciona tipo de propiedad.";
  if (!form.estado) errors.estado = "Selecciona estado.";
  if (!form.moneda) errors.moneda = "Selecciona moneda.";
  if (!form.consultarPrecio && Number(form.precio) <= 0) {
    errors.precio = "El precio debe ser mayor a 0 o activar 'Consultar precio'.";
  }
  if (!form.ubicacion.trim()) errors.ubicacion = "Ingresa una ubicacion.";
  if (!form.descripcionCorta.trim()) errors.descripcionCorta = "Completa la descripcion corta.";
  if (!form.descripcionLarga.trim()) errors.descripcionLarga = "Completa la descripcion larga.";
  if (!form.imagenPrincipal) errors.imagenPrincipal = "Define una imagen principal.";
  if (form.googleMapsUrl && !/^https?:\/\//i.test(form.googleMapsUrl.trim())) {
    errors.googleMapsUrl = "La URL debe iniciar con http:// o https://";
  }
  const isLot = ["lote", "terreno"].includes(String(form.tipoPropiedad || "").toLowerCase());
  if (isLot && form.lotOverlay?.imageUrl && !/^https?:\/|^data:image\//i.test(form.lotOverlay.imageUrl)) {
    errors.loteImageUrl = "La imagen aerea debe ser URL valida o archivo cargado.";
  }
  if (isLot && form.lotOverlay?.points?.length > 0 && form.lotOverlay.points.length < 3) {
    errors.lotePoints = "El poligono necesita al menos 3 vertices.";
  }

  return errors;
}

export function AdminPropertyFormPage() {
  const { slug } = useParams();
  const editingProperty = useMemo(() => (slug ? getPropertyBySlug(slug) : null), [slug]);
  const isEdit = Boolean(editingProperty);

  const [form, setForm] = useState(() => normalizeProperty(editingProperty));
  const [lotImageInput, setLotImageInput] = useState("");
  const [editorMode, setEditorMode] = useState(LOT_EDITOR_MODE.add);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [savingLotBoundary, setSavingLotBoundary] = useState(false);
  const [lotUploading, setLotUploading] = useState(false);
  const [propertyImagesUploading, setPropertyImagesUploading] = useState(false);
  const [extraLabelInput, setExtraLabelInput] = useState("");
  const [extraValueInput, setExtraValueInput] = useState("");
  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveFeedback, setSaveFeedback] = useState("");
  const propertyImageFileInputRef = useRef(null);
  const lotImageFileInputRef = useRef(null);
  const generatedSlug = useMemo(() => slugify(form.titulo), [form.titulo]);
  const extraFeaturesCount = (form.caracteristicasExtras || []).length;

  const allGallery = useMemo(
    () => uniqueImages([form.imagenPrincipal, ...form.imagenes]),
    [form.imagenPrincipal, form.imagenes]
  );
  const isLotProperty = ["lote", "terreno"].includes(String(form.tipoPropiedad || "").toLowerCase());

  useEffect(() => {
    syncPropertiesFromCloud();
  }, []);

  useEffect(() => {
    if (!slug) return;
    const freshProperty = getPropertyBySlug(slug);
    if (freshProperty) {
      setForm(normalizeProperty(freshProperty));
    }
  }, [slug]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSaveFeedback("");

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (numberFields.includes(name)) {
      setForm((prev) => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePropertyImageFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setPropertyImagesUploading(true);
    setSaveFeedback("Subiendo imagenes de la propiedad...");
    try {
      const propertyKey = form.id || generatedSlug || `property-${Date.now()}`;
      const uploadedUrls = [];
      for (let index = 0; index < files.length; index += 1) {
        const remoteUrl = await uploadPropertyImage(files[index], `properties/${propertyKey}/gallery`);
        uploadedUrls.push(remoteUrl);
      }

      setForm((prev) => {
        const merged = uniqueImages([prev.imagenPrincipal, ...prev.imagenes, ...uploadedUrls]);
        if (!prev.imagenPrincipal && merged.length) {
          return {
            ...prev,
            imagenPrincipal: merged[0],
            imagenes: merged.slice(1),
          };
        }
        return {
          ...prev,
          imagenes: merged.filter((item) => item !== prev.imagenPrincipal),
        };
      });

      setErrors((prev) => ({ ...prev, imagenPrincipal: "" }));
      setSaveFeedback(`Se subieron ${uploadedUrls.length} imagen(es) correctamente.`);
    } catch {
      setSaveFeedback("No se pudieron subir las imagenes. Intenta nuevamente.");
    } finally {
      setPropertyImagesUploading(false);
      event.target.value = "";
    }
  };

  const requestPropertyImageUpload = () => {
    propertyImageFileInputRef.current?.click();
  };

  const removeImage = (image) => {
    if (form.imagenPrincipal === image) {
      const rest = form.imagenes.filter((item) => item !== image);
      setForm((prev) => ({
        ...prev,
        imagenPrincipal: rest[0] || "",
        imagenes: rest.slice(1),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((item) => item !== image),
    }));
  };

  const setAsPrincipal = (image) => {
    if (form.imagenPrincipal === image) return;

    setForm((prev) => ({
      ...prev,
      imagenPrincipal: image,
      imagenes: uniqueImages([prev.imagenPrincipal, ...prev.imagenes.filter((item) => item !== image)]).filter(
        (item) => item !== image
      ),
    }));
    setErrors((prev) => ({ ...prev, imagenPrincipal: "" }));
  };

  const moveImage = (index, direction) => {
    const nextImages = [...form.imagenes];
    const target = index + direction;
    if (target < 0 || target >= nextImages.length) return;
    [nextImages[index], nextImages[target]] = [nextImages[target], nextImages[index]];
    setForm((prev) => ({ ...prev, imagenes: nextImages }));
  };

  const updateLotBoundary = (patch) => {
    setForm((prev) => ({
      ...prev,
      lotOverlay: {
        ...prev.lotOverlay,
        ...patch,
        points: normalizePolygonPoints(patch.points ?? prev.lotOverlay?.points ?? []),
      },
    }));
    setErrors((prev) => ({ ...prev, loteImageUrl: "", lotePoints: "" }));
    setSaveFeedback("");
  };

  const addLotImageUrl = () => {
    const value = lotImageInput.trim();
    if (!value) return;
    updateLotBoundary({ imageUrl: value });
    setLotImageInput("");
  };

  const removeLotImage = () => {
    updateLotBoundary({ imageUrl: "", points: [], closed: false });
  };

  const handleLotImageFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLotUploading(true);
    try {
      const propertyKey = form.id || generatedSlug || `property-${Date.now()}`;
      const remoteUrl = await uploadPropertyImage(file, `properties/${propertyKey}/lot-overlay`);
      updateLotBoundary({ imageUrl: remoteUrl });
      setSaveFeedback("Imagen aerea subida correctamente a Firebase Storage.");
    } catch {
      setSaveFeedback("No se pudo subir la imagen a Storage. Intenta nuevamente.");
    } finally {
      setLotUploading(false);
    }
    event.target.value = "";
  };

  const requestLotImageUpload = () => {
    lotImageFileInputRef.current?.click();
  };

  const saveLotBoundaryOnly = async () => {
    if (!isLotProperty) return;
    if (!form.lotOverlay?.imageUrl) {
      setSaveFeedback("Primero carga la imagen aerea.");
      return;
    }
    if ((form.lotOverlay?.points || []).length < 3 || !form.lotOverlay?.closed) {
      setSaveFeedback("Cierra el poligono con al menos 3 vertices antes de guardar.");
      return;
    }

    const payload = {
      ...form,
      id: form.id || generatedSlug || `property-${Date.now()}`,
      slug: generatedSlug,
      lotOverlay: normalizeLotOverlay(form.lotOverlay, form.superficie ? `${form.superficie} m2` : ""),
      caracteristicasExtras: normalizeExtraFeatures(form.caracteristicasExtras),
      precio: Number(form.precio),
      superficie: Number(form.superficie),
      dormitorios: Number(form.dormitorios),
      banos: Number(form.banos),
      cochera: Number(form.cochera),
      imagenes: form.imagenes.filter((image) => image !== form.imagenPrincipal),
    };

    setSavingLotBoundary(true);
    try {
      await upsertProperty(payload);
      setSaveFeedback("Delimitacion guardada en Firestore.");
    } catch {
      setSaveFeedback("No se pudo guardar la delimitacion en Firestore.");
    } finally {
      setSavingLotBoundary(false);
    }
  };

  const addExtraFeature = () => {
    const label = extraLabelInput.trim();
    const value = extraValueInput.trim();
    if (!label || !value) return;

    setForm((prev) => ({
      ...prev,
      caracteristicasExtras: [
        ...(prev.caracteristicasExtras || []),
        { id: `extra-${Date.now()}`, label, value },
      ],
    }));
    setExtraLabelInput("");
    setExtraValueInput("");
  };

  const updateExtraFeature = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      caracteristicasExtras: (prev.caracteristicasExtras || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeExtraFeature = (id) => {
    setForm((prev) => ({
      ...prev,
      caracteristicasExtras: (prev.caracteristicasExtras || []).filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      setSaveFeedback("Revisa los campos marcados para continuar.");
      return;
    }

    const payload = {
      ...form,
      id: form.id || generatedSlug || `property-${Date.now()}`,
      slug: generatedSlug,
      imagenPrincipal: form.imagenPrincipal,
      imagenes: form.imagenes.filter((image) => image !== form.imagenPrincipal),
      caracteristicasExtras: normalizeExtraFeatures(form.caracteristicasExtras),
      precio: Number(form.precio),
      superficie: Number(form.superficie),
      dormitorios: Number(form.dormitorios),
      banos: Number(form.banos),
      cochera: Number(form.cochera),
      lotOverlay: normalizeLotOverlay(form.lotOverlay, form.superficie ? `${form.superficie} m2` : ""),
    };

    try {
      await upsertProperty(payload);
      setSaveFeedback("Propiedad guardada correctamente en Firestore.");
    } catch {
      setSaveFeedback("No se pudo guardar en Firestore. Revisa conexion y permisos.");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Editor de propiedades</p>
          <h1 className="font-display text-5xl leading-none text-ink">
            {isEdit ? "Editar propiedad" : "Nueva propiedad"}
          </h1>
        </div>
        <Link
          to={ROUTES.adminProperties}
          className="text-xs font-semibold uppercase tracking-editorial text-ink underline-offset-4 hover:underline"
        >
          Volver al listado
        </Link>
      </header>

      {saveFeedback ? (
        <div className="border border-[#163649]/25 bg-[#EAF0F4] px-4 py-3 text-sm text-[#163649]">
          {saveFeedback}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormSection
          title="A. Informacion principal"
          description="Define identidad y clasificacion base de la propiedad."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Titulo" name="titulo" required error={errors.titulo}>
              <input
                id="titulo"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>

            <Field label="Tipo de operacion" name="tipoOperacion" required error={errors.tipoOperacion}>
              <select
                id="tipoOperacion"
                name="tipoOperacion"
                value={form.tipoOperacion}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              >
                <option value="">Selecciona una opcion</option>
                {OPERATION_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {formatOperationLabel(item)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de propiedad" name="tipoPropiedad" required error={errors.tipoPropiedad}>
              <select
                id="tipoPropiedad"
                name="tipoPropiedad"
                value={form.tipoPropiedad}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              >
                <option value="">Selecciona una opcion</option>
                {propertyTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Estado" name="estado" required error={errors.estado}>
              <select
                id="estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              >
                <option value="">Selecciona una opcion</option>
                {PROPERTY_STATUS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="B. Precio y ubicacion"
          description="Completa datos financieros y de localizacion para publicacion."
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_230px_auto] md:items-end">
            <Field
              label="Precio"
              name="precio"
              required={!form.consultarPrecio}
              error={errors.precio}
              help={form.consultarPrecio ? "Oculto en sitio publico." : undefined}
            >
              <input
                id="precio"
                name="precio"
                type="number"
                min="0"
                value={form.precio}
                onChange={handleChange}
                disabled={Boolean(form.consultarPrecio)}
                className={`w-full border border-stone px-4 py-3 text-sm outline-none focus:border-ink ${
                  form.consultarPrecio ? "cursor-not-allowed bg-[#EEF1F3] text-slate" : "bg-surface"
                }`}
              />
            </Field>

            <Field label="Moneda" name="moneda" required error={errors.moneda}>
              <select
                id="moneda"
                name="moneda"
                value={form.moneda}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              >
                <option value="">Selecciona una opcion</option>
                {currencies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <label
              title="Si activas esta opcion, en el sitio publico se muestra un boton de WhatsApp en lugar del precio."
              className="mb-1 inline-flex h-[46px] items-center gap-2 border border-stone bg-surface px-3 text-xs uppercase tracking-editorial text-ink"
            >
              <input
                type="checkbox"
                name="consultarPrecio"
                checked={Boolean(form.consultarPrecio)}
                onChange={handleChange}
                className="h-4 w-4 accent-[#041B2C]"
              />
              Consultar precio
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ciudad" name="ubicacion" required error={errors.ubicacion}>
              <input
                id="ubicacion"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>

            <Field
              label="URL Google Maps"
              name="googleMapsUrl"
              help="Opcional. Ejemplo: https://maps.google.com/?q=Asuncion"
              error={errors.googleMapsUrl}
            >
              <input
                id="googleMapsUrl"
                name="googleMapsUrl"
                value={form.googleMapsUrl}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="C. Caracteristicas"
          description="Especifica atributos fisicos principales de la propiedad."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Superficie (m2)" name="superficie">
              <input
                id="superficie"
                name="superficie"
                type="number"
                min="0"
                value={form.superficie}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Dormitorios" name="dormitorios">
              <input
                id="dormitorios"
                name="dormitorios"
                type="number"
                min="0"
                value={form.dormitorios}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Banos" name="banos">
              <input
                id="banos"
                name="banos"
                type="number"
                min="0"
                value={form.banos}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Cocheras" name="cochera">
              <input
                id="cochera"
                name="cochera"
                type="number"
                min="0"
                value={form.cochera}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>
          </div>

          <div className="border-t border-stone pt-3">
            <button
              type="button"
              onClick={() => setIsExtraOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-sm border border-stone bg-surface px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-editorial text-slate">
                Caracteristicas adicionales ({extraFeaturesCount})
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className={`h-4 w-4 text-slate transition-transform duration-300 ${
                  isExtraOpen ? "rotate-180" : ""
                }`}
              >
                <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <AnimatePresence initial={false}>
              {isExtraOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-3">
                    <p className="text-xs text-slate">
                      Agrega campos como "Parrillas", "Piscinas", "Quincho", etc.
                    </p>
                    <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={extraLabelInput}
                        onChange={(event) => setExtraLabelInput(event.target.value)}
                        placeholder="Nombre (ej: Parrillas)"
                        className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                      />
                      <input
                        value={extraValueInput}
                        onChange={(event) => setExtraValueInput(event.target.value)}
                        placeholder="Valor (ej: 4)"
                        className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                      />
                      <AppButton type="button" variant="ghost" onClick={addExtraFeature}>
                        Agregar
                      </AppButton>
                    </div>

                    {extraFeaturesCount > 0 ? (
                      <div className="space-y-2">
                        {(form.caracteristicasExtras || []).map((item) => (
                          <div key={item.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                            <input
                              value={item.label}
                              onChange={(event) => updateExtraFeature(item.id, "label", event.target.value)}
                              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                            />
                            <input
                              value={item.value}
                              onChange={(event) => updateExtraFeature(item.id, "value", event.target.value)}
                              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                            />
                            <AppButton type="button" variant="ghost" onClick={() => removeExtraFeature(item.id)}>
                              Eliminar
                            </AppButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate">Todavia no hay caracteristicas adicionales.</p>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </FormSection>

        <FormSection title="D. Descripciones" description="Contenido editorial para card y pagina detalle.">
          <div className="grid gap-4">
            <Field
              label="Descripcion corta"
              name="descripcionCorta"
              required
              help="Se usa en cards y listados."
              error={errors.descripcionCorta}
            >
              <textarea
                id="descripcionCorta"
                name="descripcionCorta"
                rows="3"
                value={form.descripcionCorta}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>

            <Field
              label="Descripcion larga"
              name="descripcionLarga"
              required
              help="Texto principal de la pagina individual."
              error={errors.descripcionLarga}
            >
              <textarea
                id="descripcionLarga"
                name="descripcionLarga"
                rows="6"
                value={form.descripcionLarga}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="E. Imagenes y galeria" description="Gestiona portada y orden visual de la propiedad.">
          <div className="space-y-4">
            <input
              ref={propertyImageFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePropertyImageFiles}
            />
            <Field
              label="Subir imagenes"
              name="propertyImages"
              error={errors.imagenPrincipal}
              help={
                propertyImagesUploading
                  ? "Subiendo archivos..."
                  : "Sube una o varias imagenes para la galeria."
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <AppButton
                  type="button"
                  variant="ghost"
                  className="whitespace-nowrap"
                  onClick={requestPropertyImageUpload}
                >
                  {propertyImagesUploading ? "Subiendo..." : "Subir archivos"}
                </AppButton>
                <span className="text-xs text-slate">JPG, PNG o WebP.</span>
              </div>
            </Field>

            {form.imagenPrincipal ? (
              <article className="border border-[#163649]/30 bg-[#EAF0F4] p-4">
                <p className="mb-3 text-xs uppercase tracking-editorial text-[#163649]">Imagen principal</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <img
                    src={form.imagenPrincipal}
                    alt="Portada"
                    className="h-28 w-full border border-stone object-cover sm:w-44"
                  />
                  <div className="space-y-2">
                    <p className="break-all text-xs text-[#163649]">{form.imagenPrincipal}</p>
                    <button
                      type="button"
                      onClick={() => removeImage(form.imagenPrincipal)}
                      className="text-xs uppercase tracking-editorial text-ink underline-offset-4 hover:underline"
                    >
                      Quitar portada
                    </button>
                  </div>
                </div>
              </article>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              {form.imagenes.map((image, index) => (
                <article key={`${image}-${index}`} className="border border-stone bg-surface p-3">
                  <img src={image} alt={`Galeria ${index + 1}`} className="h-28 w-full border border-stone object-cover" />
                  <p className="mt-2 break-all text-[11px] text-slate">{image}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-editorial">
                    <button type="button" onClick={() => setAsPrincipal(image)} className="text-ink hover:underline">
                      Marcar portada
                    </button>
                    <button type="button" onClick={() => moveImage(index, -1)} className="text-slate hover:underline">
                      Subir
                    </button>
                    <button type="button" onClick={() => moveImage(index, 1)} className="text-slate hover:underline">
                      Bajar
                    </button>
                    <button type="button" onClick={() => removeImage(image)} className="text-[#7A2A2A] hover:underline">
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {allGallery.length === 0 ? (
              <p className="text-sm text-slate">Todavia no hay imagenes cargadas.</p>
            ) : null}
          </div>
        </FormSection>

        {isLotProperty ? (
          <FormSection
            title="F. Delimitacion visual del lote"
            description="Marca vertices manualmente sobre imagen aerea y guarda la delimitacion."
          >
            <input
              ref={lotImageFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLotImageFile}
            />
            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
              <div className="space-y-3">
                <Field
                  label="Imagen aerea del lote"
                  name="lotImageUrl"
                  error={errors.loteImageUrl}
                  help={lotUploading ? "Subiendo imagen a Firebase Storage..." : "Puedes pegar una URL o cargar archivo desde la barra de acciones."}
                >
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="lotImageUrl"
                      value={lotImageInput}
                      onChange={(event) => setLotImageInput(event.target.value)}
                      className="w-full flex-1 border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                      placeholder="https://..."
                    />
                    <AppButton type="button" variant="ghost" onClick={addLotImageUrl}>
                      Usar URL
                    </AppButton>
                  </div>
                </Field>

                <LotBoundaryEditor
                  imageUrl={form.lotOverlay?.imageUrl}
                  points={form.lotOverlay?.points || []}
                  closed={Boolean(form.lotOverlay?.closed)}
                  mode={editorMode}
                  onModeChange={setEditorMode}
                  strokeColor={form.lotOverlay?.strokeColor}
                  strokeWidth={form.lotOverlay?.strokeWidth}
                  fillColor={form.lotOverlay?.fillColor}
                  fillOpacity={form.lotOverlay?.fillOpacity}
                  onChange={(next) => updateLotBoundary(next)}
                  onRequestImageUpload={requestLotImageUpload}
                  onRequestSave={saveLotBoundaryOnly}
                  onTogglePreview={() => setPreviewVisible((prev) => !prev)}
                  previewVisible={previewVisible}
                  isSaving={savingLotBoundary}
                />
                {errors.lotePoints ? <p className="text-xs text-[#7A2A2A]">{errors.lotePoints}</p> : null}

                <div className="space-y-2 lg:hidden">
                  <article className="border border-stone bg-surface p-4">
                    <p className="text-[11px] uppercase tracking-editorial text-slate">Estado</p>
                    <ul className="mt-2 space-y-1 text-sm text-ink">
                      <li>Imagen cargada: {form.lotOverlay?.imageUrl ? "Si" : "No"}</li>
                      <li>Puntos: {(form.lotOverlay?.points || []).length}</li>
                      <li>Poligono cerrado: {form.lotOverlay?.closed ? "Si" : "No"}</li>
                    </ul>
                  </article>
                  {previewVisible ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-editorial text-slate">Vista previa</p>
                      <LotBoundaryPreview overlay={form.lotOverlay} className="aspect-[16/10]" />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="hidden space-y-3 lg:block">
                <article className="border border-stone bg-surface p-4">
                  <p className="text-[11px] uppercase tracking-editorial text-slate">Estado</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink">
                    <li>Imagen cargada: {form.lotOverlay?.imageUrl ? "Si" : "No"}</li>
                    <li>Puntos: {(form.lotOverlay?.points || []).length}</li>
                    <li>Poligono cerrado: {form.lotOverlay?.closed ? "Si" : "No"}</li>
                  </ul>
                </article>

                <article className="border border-stone bg-surface p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-editorial text-slate">Apariencia</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1 text-xs uppercase tracking-editorial text-slate">
                      Color linea
                      <input
                        type="color"
                        value={form.lotOverlay?.strokeColor || "#7DD3FC"}
                        onChange={(event) => updateLotBoundary({ strokeColor: event.target.value })}
                        className="h-10 w-full border border-stone bg-white p-1"
                      />
                    </label>
                    <label className="space-y-1 text-xs uppercase tracking-editorial text-slate">
                      Grosor linea
                      <input
                        type="number"
                        min="0.2"
                        max="4"
                        step="0.05"
                        value={form.lotOverlay?.strokeWidth || 0.75}
                        onChange={(event) => updateLotBoundary({ strokeWidth: Number(event.target.value) })}
                        className="w-full border border-stone bg-white px-3 py-2 text-sm outline-none focus:border-ink"
                      />
                    </label>
                    <label className="space-y-1 text-xs uppercase tracking-editorial text-slate">
                      Color relleno
                      <input
                        type="color"
                        value={form.lotOverlay?.fillColor || "#50BEFF"}
                        onChange={(event) => updateLotBoundary({ fillColor: event.target.value })}
                        className="h-10 w-full border border-stone bg-white p-1"
                      />
                    </label>
                    <label className="space-y-1 text-xs uppercase tracking-editorial text-slate">
                      Opacidad relleno
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={form.lotOverlay?.fillOpacity ?? 0.18}
                        onChange={(event) => updateLotBoundary({ fillOpacity: Number(event.target.value) })}
                        className="w-full border border-stone bg-white px-3 py-2 text-sm outline-none focus:border-ink"
                      />
                    </label>
                  </div>
                </article>

                <article className="border border-stone bg-surface p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-editorial text-slate">Animacion</p>
                  <div className="space-y-2 text-sm text-ink">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.lotOverlay?.animate !== false}
                        onChange={(event) => updateLotBoundary({ animate: event.target.checked })}
                        className="h-4 w-4 accent-[#041B2C]"
                      />
                      Activar animacion
                    </label>
                    <label className="space-y-1 block text-xs uppercase tracking-editorial text-slate">
                      Duracion (seg)
                      <input
                        type="number"
                        min="0.5"
                        max="6"
                        step="0.1"
                        value={form.lotOverlay?.animationDuration || 1.35}
                        onChange={(event) => updateLotBoundary({ animationDuration: Number(event.target.value) })}
                        className="w-full border border-stone bg-white px-3 py-2 text-sm outline-none focus:border-ink"
                      />
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.lotOverlay?.animateOnView !== false}
                        onChange={(event) => updateLotBoundary({ animateOnView: event.target.checked })}
                        className="h-4 w-4 accent-[#041B2C]"
                      />
                      Reproducir al entrar en viewport
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.lotOverlay?.animateOnce !== false}
                        onChange={(event) => updateLotBoundary({ animateOnce: event.target.checked })}
                        className="h-4 w-4 accent-[#041B2C]"
                      />
                      Reproducir una sola vez
                    </label>
                  </div>
                </article>

                <article className="border border-stone bg-surface p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-editorial text-slate">Etiqueta</p>
                  <label className="inline-flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={form.lotOverlay?.showLabel !== false}
                      onChange={(event) => updateLotBoundary({ showLabel: event.target.checked })}
                      className="h-4 w-4 accent-[#041B2C]"
                    />
                    Mostrar etiqueta
                  </label>
                  <input
                    value={form.lotOverlay?.labelTitle || ""}
                    onChange={(event) => updateLotBoundary({ labelTitle: event.target.value })}
                    placeholder="Titulo"
                    className="w-full border border-stone bg-white px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <input
                    value={form.lotOverlay?.labelSubtitle || ""}
                    onChange={(event) => updateLotBoundary({ labelSubtitle: event.target.value })}
                    placeholder="Subtitulo"
                    className="w-full border border-stone bg-white px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                </article>

                {previewVisible ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-editorial text-slate">Vista previa</p>
                    <LotBoundaryPreview overlay={form.lotOverlay} className="aspect-[16/10]" />
                  </div>
                ) : null}

                {form.lotOverlay?.imageUrl ? (
                  <button
                    type="button"
                    onClick={removeLotImage}
                    className="inline-flex items-center justify-center border border-[#7A2A2A]/35 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-[#7A2A2A] transition hover:border-[#7A2A2A]"
                  >
                    Quitar imagen y delimitacion
                  </button>
                ) : null}
              </div>
            </div>
          </FormSection>
        ) : null}

        <FormSection title="G. Visibilidad" description="Controla presencia en portada y publicacion general.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-start gap-3 border border-stone bg-surface p-4">
              <input
                type="checkbox"
                name="destacadaEnPortada"
                checked={form.destacadaEnPortada}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 accent-[#041B2C]"
              />
              <span>
                <span className="block text-sm font-medium text-ink">Destacada en portada</span>
                <span className="block text-xs text-slate">Se muestra en la home publica como destacada.</span>
              </span>
            </label>

            <label className="flex items-start gap-3 border border-stone bg-surface p-4">
              <input
                type="checkbox"
                name="publicada"
                checked={form.publicada}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 accent-[#041B2C]"
              />
              <span>
                <span className="block text-sm font-medium text-ink">Publicada / visible</span>
                <span className="block text-xs text-slate">Si esta desmarcada, no deberia verse en el sitio.</span>
              </span>
            </label>
          </div>
        </FormSection>

        <div className="flex flex-wrap gap-3">
          <AppButton type="submit">{isEdit ? "Guardar cambios" : "Crear propiedad"}</AppButton>
          <AppButton to={ROUTES.adminProperties} variant="ghost">
            Volver al listado
          </AppButton>
        </div>
      </form>
    </section>
  );
}
