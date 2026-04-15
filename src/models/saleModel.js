export const SALE_PROPERTY_TYPES = ["lote", "casa", "departamento", "otro"];
export const SALE_ORIGIN_TYPES = ["web", "externo"];
export const SALE_PAYMENT_TYPES = ["contado", "financiado"];
export const SALE_STATUS = [
  "en negociacion",
  "reservada",
  "cerrada",
  "cancelada",
  "en documentacion",
];
export const SALE_INSTALLMENT_FREQUENCIES = ["mensual", "quincenal", "semanal"];
export const SALE_FILE_TYPES = [
  "cedula",
  "contrato",
  "comprobante",
  "recibo",
  "reserva",
  "otro",
];

export const emptySale = {
  id: "",
  clientId: "",
  clienteNombre: "",
  clienteTelefono: "",
  clienteEmail: "",
  clienteDocumento: "",
  vendedorResponsable: "",
  fechaVenta: "",
  tipoInmueble: "lote",
  origenVenta: "web",
  propertyId: "",
  propertyManual: "",
  precioVenta: 0,
  moneda: "USD",
  modalidad: "contado",
  senia: 0,
  saldoRestante: 0,
  observaciones: "",
  cuotasCantidad: 0,
  cuotaMonto: 0,
  frecuencia: "mensual",
  fechaPrimeraCuota: "",
  estado: "en negociacion",
  archivos: [],
  createdAt: "",
  updatedAt: "",
  createdBy: "",
  updatedBy: "",
};
