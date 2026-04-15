import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { getClients, upsertClient } from "../../content/clientsContent";
import { getProperties } from "../../content/propertiesContent";
import { getSaleById, upsertSale } from "../../content/salesContent";
import { useAuthSession } from "../../hooks/useAuthSession";
import {
  emptySale,
  SALE_FILE_TYPES,
  SALE_INSTALLMENT_FREQUENCIES,
  SALE_ORIGIN_TYPES,
  SALE_PAYMENT_TYPES,
  SALE_PROPERTY_TYPES,
  SALE_STATUS,
} from "../../models/saleModel";
import { ROUTES } from "../../router/paths";
import { formatCurrency, toTitle } from "../../utils/format";

const CLIENT_MODE = {
  existing: "existing",
  new: "new",
};

function normalizeNumeric(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeForm(base) {
  return {
    ...emptySale,
    ...base,
    precioVenta: normalizeNumeric(base?.precioVenta),
    senia: normalizeNumeric(base?.senia),
    saldoRestante: normalizeNumeric(base?.saldoRestante),
    cuotasCantidad: normalizeNumeric(base?.cuotasCantidad),
    cuotaMonto: normalizeNumeric(base?.cuotaMonto),
    archivos: Array.isArray(base?.archivos) ? base.archivos : [],
  };
}

function validateForm(form, clientMode, manualClient) {
  const errors = {};
  if (clientMode === CLIENT_MODE.existing) {
    if (!form.clientId) errors.clientId = "Selecciona cliente.";
  } else {
    if (!manualClient.nombre.trim()) errors.manualNombre = "Ingresa nombre y apellido.";
    if (!manualClient.telefono.trim()) errors.manualTelefono = "Ingresa telefono.";
  }
  if (!form.vendedorResponsable.trim()) errors.vendedorResponsable = "Ingresa vendedor responsable.";
  if (!form.fechaVenta) errors.fechaVenta = "Ingresa fecha de venta.";
  if (!form.tipoInmueble) errors.tipoInmueble = "Selecciona tipo de inmueble.";
  if (!form.origenVenta) errors.origenVenta = "Selecciona origen.";
  if (form.origenVenta === "web" && !form.propertyId) errors.propertyId = "Selecciona propiedad del sistema.";
  if (form.origenVenta === "externo" && !form.propertyManual.trim()) {
    errors.propertyManual = "Completa la propiedad externa.";
  }
  if (normalizeNumeric(form.precioVenta) <= 0) errors.precioVenta = "Ingresa un monto mayor a cero.";
  if (!form.moneda) errors.moneda = "Selecciona moneda.";
  if (!form.modalidad) errors.modalidad = "Selecciona modalidad.";
  if (!form.estado) errors.estado = "Selecciona estado.";

  if (form.modalidad === "financiado") {
    if (normalizeNumeric(form.cuotasCantidad) <= 0) errors.cuotasCantidad = "Ingresa cantidad de cuotas.";
    if (normalizeNumeric(form.cuotaMonto) <= 0) errors.cuotaMonto = "Ingresa monto de cuota.";
    if (!form.frecuencia) errors.frecuencia = "Selecciona frecuencia.";
    if (!form.fechaPrimeraCuota) errors.fechaPrimeraCuota = "Ingresa primera cuota.";
  }

  return errors;
}

function SaleSection({ title, description, children }) {
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

function Field({ label, name, error, required = false, children, help }) {
  return (
    <label className="space-y-2" htmlFor={name}>
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

function getDefaultManualClient(existingSale) {
  if (!existingSale || existingSale.clientId) {
    return {
      nombre: "",
      telefono: "",
      email: "",
      documento: "",
      saveToClients: false,
    };
  }

  return {
    nombre: existingSale.clienteNombre || "",
    telefono: existingSale.clienteTelefono || "",
    email: existingSale.clienteEmail || "",
    documento: existingSale.clienteDocumento || "",
    saveToClients: false,
  };
}

function getClientMode(existingSale, initialClient) {
  if (existingSale) return existingSale.clientId ? CLIENT_MODE.existing : CLIENT_MODE.new;
  if (initialClient) return CLIENT_MODE.existing;
  return CLIENT_MODE.new;
}

export function AdminSaleFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const existingSale = useMemo(() => (id ? getSaleById(id) : null), [id]);
  const clients = useMemo(() => getClients(), []);
  const isEdit = Boolean(existingSale);

  const preselectedClientId = searchParams.get("cliente") || "";
  const initialClient = clients.find((item) => item.id === preselectedClientId);

  const [form, setForm] = useState(() =>
    normalizeForm(
      existingSale || {
        ...emptySale,
        clientId: initialClient?.id || "",
        clienteNombre: initialClient?.nombre || "",
        clienteTelefono: initialClient?.telefono || "",
        clienteEmail: initialClient?.email || "",
        clienteDocumento: initialClient?.documento || "",
        propertyManual: initialClient?.propiedadInteres || "",
        vendedorResponsable: user?.displayName || user?.email || "Administrador Allianz",
      }
    )
  );
  const [clientMode, setClientMode] = useState(() => getClientMode(existingSale, initialClient));
  const [manualClient, setManualClient] = useState(() => getDefaultManualClient(existingSale));
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [newFile, setNewFile] = useState({
    type: SALE_FILE_TYPES[0],
    name: "",
    url: "",
  });

  const selectedClient = useMemo(
    () => clients.find((item) => item.id === form.clientId) || null,
    [clients, form.clientId]
  );

  const propertyOptions = useMemo(
    () => getProperties().map((property) => ({ id: property.id, label: property.titulo })),
    []
  );
  const propertyLabelMap = useMemo(
    () => new Map(getProperties().map((property) => [property.id, property.titulo])),
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFeedback("");
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (["precioVenta", "senia", "saldoRestante", "cuotasCantidad", "cuotaMonto"].includes(name)) {
      setForm((prev) => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
      return;
    }

    if (name === "clientId") {
      const selected = clients.find((item) => item.id === value);
      setForm((prev) => ({
        ...prev,
        clientId: value,
        clienteNombre: selected?.nombre || "",
        clienteTelefono: selected?.telefono || "",
        clienteEmail: selected?.email || "",
        clienteDocumento: selected?.documento || "",
        propertyManual:
          prev.origenVenta === "externo" ? selected?.propiedadInteres || prev.propertyManual : prev.propertyManual,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualClientChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFeedback("");
    setErrors((prev) => ({ ...prev, [`manual${name.charAt(0).toUpperCase()}${name.slice(1)}`]: "" }));
    setManualClient((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClientModeChange = (mode) => {
    setClientMode(mode);
    setFeedback("");
    setErrors((prev) => ({
      ...prev,
      clientId: "",
      manualNombre: "",
      manualTelefono: "",
    }));
  };

  const addFile = () => {
    if (!newFile.name.trim() || !newFile.url.trim()) return;
    const actor = user?.displayName || user?.email || "Administrador Allianz";
    setForm((prev) => ({
      ...prev,
      archivos: [
        ...(prev.archivos || []),
        {
          id: `sf-${Date.now()}`,
          type: newFile.type,
          name: newFile.name.trim(),
          url: newFile.url.trim(),
          uploadedAt: new Date().toISOString(),
          uploadedBy: actor,
        },
      ],
    }));
    setNewFile({
      type: SALE_FILE_TYPES[0],
      name: "",
      url: "",
    });
  };

  const removeFile = (fileId) => {
    setForm((prev) => ({
      ...prev,
      archivos: (prev.archivos || []).filter((item) => item.id !== fileId),
    }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateForm(form, clientMode, manualClient);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setFeedback("Revisa los campos marcados antes de guardar.");
      return;
    }

    const actor = user?.displayName || user?.email || "Administrador Allianz";
    const nowDate = new Date();
    const nowISO = nowDate.toISOString().slice(0, 10);
    const interestFromSale =
      form.origenVenta === "web" ? propertyLabelMap.get(form.propertyId) || "" : form.propertyManual;

    let resolvedClientId = form.clientId;
    let resolvedClientName = selectedClient?.nombre || form.clienteNombre;
    let resolvedClientPhone = selectedClient?.telefono || form.clienteTelefono;
    let resolvedClientEmail = selectedClient?.email || form.clienteEmail;
    let resolvedClientDocument = selectedClient?.documento || form.clienteDocumento;

    if (clientMode === CLIENT_MODE.new) {
      const manualName = manualClient.nombre.trim();
      const manualPhone = manualClient.telefono.trim();
      const manualEmail = manualClient.email.trim();
      const manualDocument = manualClient.documento.trim();

      resolvedClientId = "";
      resolvedClientName = manualName;
      resolvedClientPhone = manualPhone;
      resolvedClientEmail = manualEmail;
      resolvedClientDocument = manualDocument;

      if (manualClient.saveToClients) {
        const newClientId = `c-${Date.now()}`;
        upsertClient({
          id: newClientId,
          nombre: manualName,
          telefono: manualPhone,
          email: manualEmail,
          documento: manualDocument,
          tipoCliente: "comprador",
          propiedadInteres: interestFromSale,
          estado: "interesado",
          fechaUltimoContacto: nowISO,
          fechaProximoContacto: form.fechaVenta || nowISO,
          gestiones: [],
        });
        resolvedClientId = newClientId;
      }
    }

    const payload = {
      ...form,
      id: isEdit ? form.id : `s-${Date.now()}`,
      clientId: resolvedClientId,
      clienteNombre: resolvedClientName,
      clienteTelefono: resolvedClientPhone,
      clienteEmail: resolvedClientEmail,
      clienteDocumento: resolvedClientDocument,
      precioVenta: normalizeNumeric(form.precioVenta),
      senia: normalizeNumeric(form.senia),
      saldoRestante: normalizeNumeric(form.saldoRestante),
      cuotasCantidad: normalizeNumeric(form.cuotasCantidad),
      cuotaMonto: normalizeNumeric(form.cuotaMonto),
      propertyManual: form.origenVenta === "externo" ? form.propertyManual : "",
      propertyId: form.origenVenta === "web" ? form.propertyId : "",
      createdBy: form.createdBy || actor,
      updatedBy: actor,
    };

    upsertSale(payload, { userName: actor });
    navigate(ROUTES.adminSales);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Gestion comercial</p>
          <h1 className="font-display text-5xl leading-none text-ink">
            {isEdit ? "Editar venta" : "Registrar venta"}
          </h1>
          <p className="mt-2 text-sm text-slate">
            Carga operacion, financiacion y documentos asociados para trazabilidad completa.
          </p>
        </div>
        <Link
          to={ROUTES.adminSales}
          className="text-xs font-semibold uppercase tracking-editorial text-ink underline-offset-4 hover:underline"
        >
          Volver a ventas
        </Link>
      </header>

      {feedback ? (
        <div className="border border-[#163649]/25 bg-[#EAF0F4] px-4 py-3 text-sm text-[#163649]">
          {feedback}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <SaleSection
          title="A. Operacion"
          description="Relaciona cliente, vendedor y origen de la venta."
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-sm border border-stone bg-surface p-1">
              <button
                type="button"
                onClick={() => handleClientModeChange(CLIENT_MODE.existing)}
                className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial transition ${
                  clientMode === CLIENT_MODE.existing ? "bg-[#041B2C] text-white" : "text-ink hover:bg-white"
                }`}
              >
                Cliente existente
              </button>
              <button
                type="button"
                onClick={() => handleClientModeChange(CLIENT_MODE.new)}
                className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial transition ${
                  clientMode === CLIENT_MODE.new ? "bg-[#041B2C] text-white" : "text-ink hover:bg-white"
                }`}
              >
                Nuevo cliente
              </button>
            </div>

            {clientMode === CLIENT_MODE.existing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cliente" name="clientId" required error={errors.clientId}>
                  <select
                    id="clientId"
                    name="clientId"
                    value={form.clientId}
                    onChange={handleChange}
                    className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                  >
                    <option value="">Selecciona cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nombre}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="rounded-sm border border-[#163649]/20 bg-[#F4F7F9] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-editorial text-slate">Detalle cliente</p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {selectedClient?.nombre || "Selecciona un cliente"}
                  </p>
                  <p className="text-xs text-slate">
                    {selectedClient?.telefono || "-"}
                    {selectedClient?.email ? ` · ${selectedClient.email}` : ""}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombre y apellido" name="manualNombre" required error={errors.manualNombre}>
                  <input
                    id="manualNombre"
                    name="nombre"
                    value={manualClient.nombre}
                    onChange={handleManualClientChange}
                    className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                </Field>

                <Field label="Telefono" name="manualTelefono" required error={errors.manualTelefono}>
                  <input
                    id="manualTelefono"
                    name="telefono"
                    value={manualClient.telefono}
                    onChange={handleManualClientChange}
                    className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                </Field>

                <Field label="Email (opcional)" name="manualEmail">
                  <input
                    id="manualEmail"
                    name="email"
                    value={manualClient.email}
                    onChange={handleManualClientChange}
                    className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                </Field>

                <Field label="Documento (opcional)" name="manualDocumento">
                  <input
                    id="manualDocumento"
                    name="documento"
                    value={manualClient.documento}
                    onChange={handleManualClientChange}
                    className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                </Field>

                <label className="md:col-span-2 inline-flex items-center gap-2 rounded-sm border border-stone bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-editorial text-ink">
                  <input
                    type="checkbox"
                    name="saveToClients"
                    checked={Boolean(manualClient.saveToClients)}
                    onChange={handleManualClientChange}
                    className="h-4 w-4 accent-[#041B2C]"
                  />
                  Guardar tambien este cliente en el modulo de Clientes
                </label>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Vendedor responsable" name="vendedorResponsable" required error={errors.vendedorResponsable}>
              <input
                id="vendedorResponsable"
                name="vendedorResponsable"
                value={form.vendedorResponsable}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>

            <Field label="Fecha de venta" name="fechaVenta" required error={errors.fechaVenta}>
              <input
                id="fechaVenta"
                type="date"
                name="fechaVenta"
                value={form.fechaVenta}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>

            <Field label="Tipo de inmueble" name="tipoInmueble" required error={errors.tipoInmueble}>
              <select
                id="tipoInmueble"
                name="tipoInmueble"
                value={form.tipoInmueble}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              >
                {SALE_PROPERTY_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {toTitle(item)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Origen de la venta" name="origenVenta" required error={errors.origenVenta}>
              <select
                id="origenVenta"
                name="origenVenta"
                value={form.origenVenta}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              >
                {SALE_ORIGIN_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item === "web" ? "Propiedad publicada en la web" : "Propiedad/lote externo"}
                  </option>
                ))}
              </select>
            </Field>

            {form.origenVenta === "web" ? (
              <Field label="Propiedad del sistema" name="propertyId" required error={errors.propertyId}>
                <select
                  id="propertyId"
                  name="propertyId"
                  value={form.propertyId}
                  onChange={handleChange}
                  className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                >
                  <option value="">Selecciona propiedad</option>
                  {propertyOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label="Propiedad o lote externo" name="propertyManual" required error={errors.propertyManual}>
                <input
                  id="propertyManual"
                  name="propertyManual"
                  value={form.propertyManual}
                  onChange={handleChange}
                  placeholder="Ej: Lote premium sector este"
                  className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                />
              </Field>
            )}
          </div>
        </SaleSection>

        <SaleSection
          title="B. Detalle comercial"
          description="Define monto, modalidad y condiciones de la operacion."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Precio de venta" name="precioVenta" required error={errors.precioVenta}>
              <input
                id="precioVenta"
                name="precioVenta"
                type="number"
                min="0"
                value={form.precioVenta}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>

            <Field label="Moneda" name="moneda" required error={errors.moneda}>
              <input
                id="moneda"
                name="moneda"
                value={form.moneda}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>

            <Field label="Modalidad" name="modalidad" required error={errors.modalidad}>
              <select
                id="modalidad"
                name="modalidad"
                value={form.modalidad}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              >
                {SALE_PAYMENT_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {toTitle(item)}
                  </option>
                ))}
              </select>
            </Field>

            <div className="rounded-sm border border-[#163649]/20 bg-[#F4F7F9] px-4 py-3">
              <p className="text-[11px] uppercase tracking-editorial text-slate">Monto referencial</p>
              <p className="mt-1 text-sm font-semibold text-ink">{formatCurrency(form.precioVenta, form.moneda)}</p>
            </div>

            <Field label="Senia / entrega inicial" name="senia">
              <input
                id="senia"
                name="senia"
                type="number"
                min="0"
                value={form.senia}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>

            <Field label="Saldo restante" name="saldoRestante">
              <input
                id="saldoRestante"
                name="saldoRestante"
                type="number"
                min="0"
                value={form.saldoRestante}
                onChange={handleChange}
                className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </Field>
          </div>

          {form.modalidad === "financiado" ? (
            <div className="grid gap-4 border-t border-stone pt-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Cantidad de cuotas" name="cuotasCantidad" required error={errors.cuotasCantidad}>
                <input
                  id="cuotasCantidad"
                  name="cuotasCantidad"
                  type="number"
                  min="1"
                  value={form.cuotasCantidad}
                  onChange={handleChange}
                  className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Monto de cuota" name="cuotaMonto" required error={errors.cuotaMonto}>
                <input
                  id="cuotaMonto"
                  name="cuotaMonto"
                  type="number"
                  min="0"
                  value={form.cuotaMonto}
                  onChange={handleChange}
                  className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                />
              </Field>
              <Field label="Frecuencia" name="frecuencia" required error={errors.frecuencia}>
                <select
                  id="frecuencia"
                  name="frecuencia"
                  value={form.frecuencia}
                  onChange={handleChange}
                  className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                >
                  {SALE_INSTALLMENT_FREQUENCIES.map((item) => (
                    <option key={item} value={item}>
                      {toTitle(item)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fecha primera cuota" name="fechaPrimeraCuota" required error={errors.fechaPrimeraCuota}>
                <input
                  id="fechaPrimeraCuota"
                  type="date"
                  name="fechaPrimeraCuota"
                  value={form.fechaPrimeraCuota}
                  onChange={handleChange}
                  className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
                />
              </Field>
            </div>
          ) : null}

          <Field label="Observaciones" name="observaciones">
            <textarea
              id="observaciones"
              name="observaciones"
              rows={3}
              value={form.observaciones}
              onChange={handleChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
              placeholder="Contexto comercial, acuerdos y puntos a revisar."
            />
          </Field>
        </SaleSection>

        <SaleSection title="C. Estado de la venta" description="Controla el estado actual de la operacion.">
          <Field label="Estado" name="estado" required error={errors.estado}>
            <select
              id="estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            >
              {SALE_STATUS.map((item) => (
                <option key={item} value={item}>
                  {toTitle(item)}
                </option>
              ))}
            </select>
          </Field>
        </SaleSection>

        <SaleSection
          title="D. Archivos de la venta"
          description="Adjunta y centraliza documentacion para consultar en cualquier momento."
        >
          <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_auto]">
            <select
              value={newFile.type}
              onChange={(event) => setNewFile((prev) => ({ ...prev, type: event.target.value }))}
              className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
            >
              {SALE_FILE_TYPES.map((item) => (
                <option key={item} value={item}>
                  {toTitle(item)}
                </option>
              ))}
            </select>
            <input
              value={newFile.name}
              onChange={(event) => setNewFile((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nombre del archivo"
              className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
            />
            <input
              value={newFile.url}
              onChange={(event) => setNewFile((prev) => ({ ...prev, url: event.target.value }))}
              placeholder="https://..."
              className="w-full border border-stone bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink"
            />
            <AppButton type="button" variant="ghost" onClick={addFile}>
              Agregar
            </AppButton>
          </div>

          <div className="space-y-2">
            {(form.archivos || []).length ? (
              form.archivos.map((file) => (
                <article
                  key={file.id}
                  className="grid gap-2 border border-stone bg-surface px-3 py-3 text-sm md:grid-cols-[140px_1fr_auto]"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-editorial text-slate">{toTitle(file.type)}</p>
                    <p className="text-[11px] text-slate">
                      {new Intl.DateTimeFormat("es-PY", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(file.uploadedAt))}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{file.name}</p>
                    <p className="break-all text-xs text-slate">{file.url}</p>
                    <p className="text-[11px] text-slate">Subido por {file.uploadedBy}</p>
                  </div>
                  <div className="flex flex-wrap items-start justify-end gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center border border-stone bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:border-ink"
                    >
                      Ver
                    </a>
                    <a
                      href={file.url}
                      download
                      className="inline-flex items-center justify-center border border-stone bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-editorial text-ink transition hover:border-ink"
                    >
                      Descargar
                    </a>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="inline-flex items-center justify-center border border-[#7A2A2A]/35 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-editorial text-[#7A2A2A] transition hover:border-[#7A2A2A]"
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate">Todavia no hay archivos cargados para esta venta.</p>
            )}
          </div>
        </SaleSection>

        <div className="flex flex-wrap gap-3">
          <AppButton type="submit">{isEdit ? "Guardar cambios" : "Registrar venta"}</AppButton>
          <AppButton to={ROUTES.adminSales} variant="ghost">
            Cancelar
          </AppButton>
        </div>
      </form>
    </section>
  );
}
