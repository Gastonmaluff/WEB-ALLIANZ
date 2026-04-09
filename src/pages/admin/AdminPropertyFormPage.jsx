import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { emptyProperty, OPERATION_TYPES, PROPERTY_STATUS } from "../../models/propertyModel";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { ROUTES } from "../../router/paths";

const propertyTypes = ["Casa", "Departamento", "Terreno", "Oficina"];
const currencies = ["USD", "PYG"];

function normalizeProperty(foundProperty) {
  if (!foundProperty) return { ...emptyProperty };
  return {
    ...emptyProperty,
    ...foundProperty,
    imagenes: Array.isArray(foundProperty.imagenes) ? foundProperty.imagenes : [],
  };
}

export function AdminPropertyFormPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const editingProperty = useMemo(
    () => MOCK_PROPERTIES.find((property) => property.slug === slug),
    [slug]
  );
  const isEdit = Boolean(editingProperty);

  const [form, setForm] = useState(() => normalizeProperty(editingProperty));
  const [galleryInput, setGalleryInput] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addImage = () => {
    if (!galleryInput.trim()) return;
    setForm((prev) => ({ ...prev, imagenes: [...prev.imagenes, galleryInput.trim()] }));
    setGalleryInput("");
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Payload listo para Firestore:", form);
    navigate(ROUTES.adminProperties);
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-editorial text-slate">CRUD propiedad</p>
        <h1 className="font-display text-5xl">
          {isEdit ? "Editar propiedad" : "Nueva propiedad"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 border-fine bg-paper p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            placeholder="Titulo"
            required
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="slug"
            required
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <select
            name="tipoOperacion"
            value={form.tipoOperacion}
            onChange={handleChange}
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          >
            {OPERATION_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="tipoPropiedad"
            value={form.tipoPropiedad}
            onChange={handleChange}
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          >
            <option value="">Tipo de propiedad</option>
            {propertyTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            name="precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            placeholder="Precio"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <select
            name="moneda"
            value={form.moneda}
            onChange={handleChange}
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          >
            {currencies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            placeholder="Ubicacion"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            name="googleMapsUrl"
            value={form.googleMapsUrl}
            onChange={handleChange}
            placeholder="Google Maps URL"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            name="superficie"
            type="number"
            value={form.superficie}
            onChange={handleChange}
            placeholder="Superficie m2"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            name="dormitorios"
            type="number"
            value={form.dormitorios}
            onChange={handleChange}
            placeholder="Dormitorios"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            name="banos"
            type="number"
            value={form.banos}
            onChange={handleChange}
            placeholder="Banos"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            name="cochera"
            type="number"
            value={form.cochera}
            onChange={handleChange}
            placeholder="Cochera"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          >
            {PROPERTY_STATUS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            name="imagenPrincipal"
            value={form.imagenPrincipal}
            onChange={handleChange}
            placeholder="URL imagen principal"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink md:col-span-2"
          />
          <textarea
            name="descripcionCorta"
            rows="2"
            value={form.descripcionCorta}
            onChange={handleChange}
            placeholder="Descripcion corta"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink md:col-span-2"
          />
          <textarea
            name="descripcionLarga"
            rows="4"
            value={form.descripcionLarga}
            onChange={handleChange}
            placeholder="Descripcion larga"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink md:col-span-2"
          />
        </div>

        <div className="border-fine bg-surface p-4">
          <p className="mb-3 text-xs uppercase tracking-editorial text-slate">Galeria</p>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={galleryInput}
              onChange={(event) => setGalleryInput(event.target.value)}
              placeholder="Agregar URL imagen"
              className="flex-1 border border-stone bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <AppButton type="button" variant="ghost" onClick={addImage}>
              Agregar
            </AppButton>
          </div>
          <ul className="grid gap-2">
            {form.imagenes.map((image, index) => (
              <li key={`${image}-${index}`} className="flex items-center justify-between gap-3 bg-paper p-3">
                <span className="truncate text-xs text-slate">{image}</span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-xs uppercase tracking-editorial text-ink underline-offset-4 hover:underline"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate">
          <input
            type="checkbox"
            name="destacadaEnPortada"
            checked={form.destacadaEnPortada}
            onChange={handleChange}
            className="h-4 w-4 accent-ink"
          />
          Destacada en portada
        </label>

        <div className="flex flex-wrap gap-3">
          <AppButton type="submit">{isEdit ? "Guardar cambios" : "Crear propiedad"}</AppButton>
          <AppButton to={ROUTES.adminProperties} variant="ghost">
            Cancelar
          </AppButton>
        </div>
      </form>
    </section>
  );
}
