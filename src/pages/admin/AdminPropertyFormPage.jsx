import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppButton } from "../../components/common/AppButton";
import { emptyProperty, OPERATION_TYPES, PROPERTY_STATUS } from "../../models/propertyModel";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { ROUTES } from "../../router/paths";
import { formatOperationLabel, slugify } from "../../utils/format";

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

function normalizeProperty(foundProperty) {
  if (!foundProperty) {
    return {
      ...emptyProperty,
      publicada: true,
      consultarPrecio: false,
      caracteristicasExtras: [],
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

  return errors;
}

export function AdminPropertyFormPage() {
  const { slug } = useParams();
  const editingProperty = useMemo(
    () => MOCK_PROPERTIES.find((property) => property.slug === slug),
    [slug]
  );
  const isEdit = Boolean(editingProperty);

  const [form, setForm] = useState(() => normalizeProperty(editingProperty));
  const [galleryInput, setGalleryInput] = useState("");
  const [extraLabelInput, setExtraLabelInput] = useState("");
  const [extraValueInput, setExtraValueInput] = useState("");
  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveFeedback, setSaveFeedback] = useState("");
  const generatedSlug = useMemo(() => slugify(form.titulo), [form.titulo]);
  const extraFeaturesCount = (form.caracteristicasExtras || []).length;

  const allGallery = useMemo(
    () => uniqueImages([form.imagenPrincipal, ...form.imagenes]),
    [form.imagenPrincipal, form.imagenes]
  );

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

  const addImage = () => {
    const image = galleryInput.trim();
    if (!image) return;

    const all = uniqueImages([form.imagenPrincipal, ...form.imagenes, image]);
    if (!form.imagenPrincipal) {
      setForm((prev) => ({ ...prev, imagenPrincipal: image, imagenes: prev.imagenes }));
    } else {
      setForm((prev) => ({
        ...prev,
        imagenes: all.filter((item) => item !== prev.imagenPrincipal),
      }));
    }
    setGalleryInput("");
    setErrors((prev) => ({ ...prev, imagenPrincipal: "" }));
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      setSaveFeedback("Revisa los campos marcados para continuar.");
      return;
    }

    const payload = {
      ...form,
      slug: generatedSlug,
      imagenPrincipal: form.imagenPrincipal,
      imagenes: form.imagenes.filter((image) => image !== form.imagenPrincipal),
      caracteristicasExtras: normalizeExtraFeatures(form.caracteristicasExtras),
      precio: Number(form.precio),
      superficie: Number(form.superficie),
      dormitorios: Number(form.dormitorios),
      banos: Number(form.banos),
      cochera: Number(form.cochera),
    };

    console.log("Payload listo para Firestore:", payload);
    setSaveFeedback("Cambios guardados localmente. Listo para conectar Firestore.");
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
            <Field label="Ubicacion visible" name="ubicacion" required error={errors.ubicacion}>
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
            <Field
              label="Agregar URL de imagen"
              name="newImage"
              error={errors.imagenPrincipal}
              help="Puedes definir portada desde las miniaturas."
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="newImage"
                  value={galleryInput}
                  onChange={(event) => setGalleryInput(event.target.value)}
                  className="w-full flex-1 border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                  placeholder="https://..."
                />
                <AppButton type="button" variant="ghost" onClick={addImage} className="whitespace-nowrap">
                  Agregar imagen
                </AppButton>
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

        <FormSection title="F. Visibilidad" description="Controla presencia en portada y publicacion general.">
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
