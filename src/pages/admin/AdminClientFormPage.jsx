import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { getClientById, upsertClient } from "../../content/clientsContent";
import { CLIENT_STATUS, CLIENT_TYPES, emptyClient } from "../../models/clientModel";
import { ROUTES } from "../../router/paths";

function normalizeClientForForm(client) {
  if (!client) return { ...emptyClient };
  return {
    ...emptyClient,
    ...client,
  };
}

function validateForm(form) {
  const errors = {};
  if (!form.nombre.trim()) errors.nombre = "Ingresa nombre del cliente.";
  if (!form.telefono.trim()) errors.telefono = "Ingresa telefono para seguimiento.";
  if (!form.tipoCliente) errors.tipoCliente = "Selecciona tipo de cliente.";
  if (!form.estado) errors.estado = "Selecciona estado.";
  if (!form.propiedadInteres.trim()) errors.propiedadInteres = "Ingresa propiedad de interes.";
  return errors;
}

export function AdminClientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existingClient = useMemo(() => (id ? getClientById(id) : null), [id]);
  const isEdit = Boolean(existingClient);

  const [form, setForm] = useState(() => normalizeClientForForm(existingClient));
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFeedback("");
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setFeedback("Revisa los campos marcados para guardar.");
      return;
    }

    const payload = {
      ...form,
      id: isEdit ? form.id : `c-${Date.now()}`,
      telefono: String(form.telefono || "").replace(/\s+/g, ""),
    };
    upsertClient(payload);
    navigate(ROUTES.adminClients);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Seguimiento comercial</p>
          <h1 className="font-display text-5xl leading-none text-ink">
            {isEdit ? "Editar cliente" : "Nuevo cliente"}
          </h1>
          <p className="mt-2 text-sm text-slate">
            Completa datos clave para definir proximos contactos y acciones comerciales.
          </p>
        </div>
        <Link
          to={ROUTES.adminClients}
          className="text-xs font-semibold uppercase tracking-editorial text-ink underline-offset-4 hover:underline"
        >
          Volver a clientes
        </Link>
      </header>

      {feedback ? (
        <div className="border border-[#163649]/25 bg-[#EAF0F4] px-4 py-3 text-sm text-[#163649]">
          {feedback}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="admin-card space-y-5" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Nombre</span>
            <input
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
            {errors.nombre ? <p className="text-xs text-[#7A2A2A]">{errors.nombre}</p> : null}
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Telefono</span>
            <input
              name="telefono"
              value={form.telefono}
              onChange={onChange}
              placeholder="595981000000"
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
            {errors.telefono ? <p className="text-xs text-[#7A2A2A]">{errors.telefono}</p> : null}
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Tipo de cliente</span>
            <select
              name="tipoCliente"
              value={form.tipoCliente}
              onChange={onChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            >
              {CLIENT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.tipoCliente ? <p className="text-xs text-[#7A2A2A]">{errors.tipoCliente}</p> : null}
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Estado</span>
            <select
              name="estado"
              value={form.estado}
              onChange={onChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            >
              {CLIENT_STATUS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.estado ? <p className="text-xs text-[#7A2A2A]">{errors.estado}</p> : null}
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Propiedad de interes</span>
            <input
              name="propiedadInteres"
              value={form.propiedadInteres}
              onChange={onChange}
              placeholder="Ej: The Glass Villa"
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
            {errors.propiedadInteres ? <p className="text-xs text-[#7A2A2A]">{errors.propiedadInteres}</p> : null}
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Fecha ultimo contacto</span>
            <input
              type="date"
              name="fechaUltimoContacto"
              value={form.fechaUltimoContacto}
              onChange={onChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-editorial text-slate">Fecha proximo contacto</span>
            <input
              type="date"
              name="fechaProximoContacto"
              value={form.fechaProximoContacto}
              onChange={onChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <AppButton type="submit">{isEdit ? "Guardar cambios" : "Crear cliente"}</AppButton>
          <AppButton to={ROUTES.adminClients} variant="ghost">
            Cancelar
          </AppButton>
        </div>
      </form>
    </section>
  );
}

