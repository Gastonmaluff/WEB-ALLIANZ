import { useMemo, useState } from "react";
import { AppButton } from "../../components/common/AppButton";
import { ROUTES } from "../../router/paths";
import {
  getHeroContent,
  resetHeroContent,
  saveHeroContent,
} from "../../content/heroContent";

function uniqueImages(images) {
  return [...new Set(images.map((img) => img.trim()).filter(Boolean))];
}

function validateHeroForm(form) {
  const errors = {};
  if (!form.eyebrow.trim()) errors.eyebrow = "Ingresa un texto corto superior.";
  if (!form.title.trim()) errors.title = "Ingresa el titulo principal del Hero.";
  if (!form.description.trim()) errors.description = "Ingresa la descripcion principal.";
  if (!form.ctaLabel.trim()) errors.ctaLabel = "Ingresa texto para el boton.";
  if (!form.ctaTo.trim()) errors.ctaTo = "Ingresa una ruta o URL para el boton.";
  if (!/^\/|^https?:\/\//i.test(form.ctaTo.trim())) {
    errors.ctaTo = "Debe iniciar con / o con http:// / https://";
  }
  if (!form.images.length) errors.images = "Agrega al menos una imagen para el slider.";
  return errors;
}

export function AdminHeroPage() {
  const [form, setForm] = useState(() => getHeroContent());
  const [newImage, setNewImage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});

  const previewImages = useMemo(() => form.images.filter(Boolean), [form.images]);

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", images: "" }));
    setFeedback("");
  };

  const addImage = () => {
    const image = newImage.trim();
    if (!image) return;
    const nextImages = uniqueImages([...form.images, image]);
    setForm((prev) => ({ ...prev, images: nextImages }));
    setNewImage("");
    setErrors((prev) => ({ ...prev, images: "" }));
    setFeedback("");
  };

  const removeImage = (image) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((item) => item !== image),
    }));
    setFeedback("");
  };

  const moveImage = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= form.images.length) return;
    const next = [...form.images];
    [next[index], next[target]] = [next[target], next[index]];
    setForm((prev) => ({ ...prev, images: next }));
    setFeedback("");
  };

  const onSave = (event) => {
    event.preventDefault();
    const validationErrors = validateHeroForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setFeedback("Revisa los campos indicados para guardar.");
      return;
    }

    const saved = saveHeroContent({
      ...form,
      images: uniqueImages(form.images),
    });
    setForm(saved);
    setFeedback("Hero actualizado correctamente.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onReset = () => {
    const defaults = resetHeroContent();
    setForm(defaults);
    setErrors({});
    setFeedback("Hero restaurado a valores por defecto.");
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Contenido principal</p>
          <h1 className="font-display text-5xl leading-none text-ink">Hero de Home</h1>
          <p className="mt-2 text-sm text-slate">
            Edita textos y slider de imagenes de la portada publica.
          </p>
        </div>
        <AppButton to={ROUTES.home} variant="ghost">
          Ver sitio
        </AppButton>
      </header>

      {feedback ? (
        <div className="border border-[#163649]/25 bg-[#EAF0F4] px-4 py-3 text-sm text-[#163649]">
          {feedback}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={onSave} noValidate>
        <section className="admin-card space-y-4">
          <h2 className="font-display text-3xl leading-none text-ink">Textos y accion</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-editorial text-slate">
                Texto superior
              </span>
              <input
                name="eyebrow"
                value={form.eyebrow}
                onChange={onFieldChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
              {errors.eyebrow ? <p className="text-xs text-[#7A2A2A]">{errors.eyebrow}</p> : null}
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-editorial text-slate">
                Texto del boton
              </span>
              <input
                name="ctaLabel"
                value={form.ctaLabel}
                onChange={onFieldChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
              {errors.ctaLabel ? <p className="text-xs text-[#7A2A2A]">{errors.ctaLabel}</p> : null}
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Titulo principal</span>
              <textarea
                name="title"
                rows="3"
                value={form.title}
                onChange={onFieldChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
              {errors.title ? <p className="text-xs text-[#7A2A2A]">{errors.title}</p> : null}
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-editorial text-slate">
                Descripcion
              </span>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={onFieldChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
              {errors.description ? <p className="text-xs text-[#7A2A2A]">{errors.description}</p> : null}
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-editorial text-slate">
                Link del boton
              </span>
              <input
                name="ctaTo"
                value={form.ctaTo}
                onChange={onFieldChange}
                placeholder="/propiedades"
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
              {errors.ctaTo ? <p className="text-xs text-[#7A2A2A]">{errors.ctaTo}</p> : null}
            </label>
          </div>
        </section>

        <section className="admin-card space-y-4">
          <h2 className="font-display text-3xl leading-none text-ink">Imagenes del slider</h2>
          <p className="text-sm text-slate">
            Puedes agregar, quitar y reordenar imagenes para el Hero principal.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={newImage}
              onChange={(event) => setNewImage(event.target.value)}
              placeholder="https://..."
              className="w-full flex-1 border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <AppButton type="button" variant="ghost" onClick={addImage} className="whitespace-nowrap">
              Agregar imagen
            </AppButton>
          </div>

          {errors.images ? <p className="text-xs text-[#7A2A2A]">{errors.images}</p> : null}

          <div className="grid gap-3 md:grid-cols-2">
            {previewImages.map((image, index) => (
              <article key={`${image}-${index}`} className="border border-stone bg-surface p-3">
                <img src={image} alt={`Hero ${index + 1}`} className="h-28 w-full border border-stone object-cover" />
                <p className="mt-2 break-all text-[11px] text-slate">{image}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-editorial">
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
          {previewImages.length === 0 ? <p className="text-sm text-slate">Todavia no hay imagenes.</p> : null}
        </section>

        <div className="flex flex-wrap gap-3">
          <AppButton type="submit">Guardar Hero</AppButton>
          <AppButton type="button" variant="ghost" onClick={onReset}>
            Restaurar por defecto
          </AppButton>
        </div>
      </form>
    </section>
  );
}

