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

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addTestimonial = (event) => {
    event.preventDefault();
    if (!form.nombre || !form.mensaje) return;

    setItems((prev) => [
      {
        id: `t-${Date.now()}`,
        ...form,
      },
      ...prev,
    ]);
    setForm(initialForm);
  };

  const removeTestimonial = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-editorial text-slate">CRUD simple</p>
        <h1 className="font-display text-5xl">Testimonios</h1>
      </div>

      <form onSubmit={addTestimonial} className="admin-card space-y-3">
        <h2 className="font-display text-3xl">Nuevo testimonio</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            placeholder="Nombre"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            name="rol"
            value={form.rol}
            onChange={onChange}
            placeholder="Rol"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <textarea
            name="mensaje"
            rows="3"
            value={form.mensaje}
            onChange={onChange}
            placeholder="Mensaje"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink md:col-span-2"
          />
        </div>
        <AppButton type="submit">Agregar testimonio</AppButton>
      </form>

      <div className="admin-card">
        <h2 className="mb-4 font-display text-3xl">Listado</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border border-stone bg-surface p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{item.nombre}</p>
                  <p className="text-xs uppercase tracking-editorial text-slate">{item.rol}</p>
                </div>
                <button
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
