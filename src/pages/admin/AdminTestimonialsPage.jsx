import { useState } from "react";
import { MOCK_TESTIMONIALS } from "../../mocks/testimonials";
import { AppButton } from "../../components/common/AppButton";

const initialForm = {
  nombre: "",
  rol: "",
  mensaje: "",
};

export function AdminTestimonialsPage() {
  const [items, setItems] = useState(MOCK_TESTIMONIALS);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addTestimonial = (event) => {
    event.preventDefault();
    if (!form.nombre || !form.mensaje) {
      setFeedback("Completa nombre y mensaje para guardar.");
      return;
    }

    setItems((prev) => [{ id: `t-${Date.now()}`, ...form }, ...prev]);
    setForm(initialForm);
    setFeedback("Testimonio agregado correctamente.");
  };

  const removeTestimonial = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-editorial text-slate">Contenido institucional</p>
        <h1 className="font-display text-5xl leading-none text-ink">Testimonios</h1>
        <p className="mt-2 text-sm text-slate">Gestiona opiniones visibles en el sitio publico.</p>
      </header>

      <form onSubmit={addTestimonial} className="admin-card space-y-4">
        <h2 className="font-display text-3xl leading-none text-ink">Nuevo testimonio</h2>
        {feedback ? <p className="text-sm text-[#163649]">{feedback}</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Nombre</span>
            <input
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Rol</span>
            <input
              name="rol"
              value={form.rol}
              onChange={onChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              placeholder="Ejemplo: Inversionista"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Mensaje</span>
            <textarea
              name="mensaje"
              rows="4"
              value={form.mensaje}
              onChange={onChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>
        </div>
        <AppButton type="submit">Agregar testimonio</AppButton>
      </form>

      <div className="admin-card">
        <h2 className="mb-4 font-display text-3xl leading-none text-ink">Listado</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border border-stone bg-surface p-4">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{item.nombre}</p>
                  <p className="text-xs uppercase tracking-editorial text-slate">{item.rol}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeTestimonial(item.id)}
                  className="text-xs uppercase tracking-editorial text-ink underline-offset-4 hover:underline"
                >
                  Eliminar
                </button>
              </div>
              <p className="text-sm text-slate">{item.mensaje}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
