export const CLIENT_STATUS = [
  "interesado",
  "contactado",
  "visita agendada",
  "negociacion",
  "propuesta enviada",
  "cerrado",
];

export const CLIENT_TYPES = ["comprador", "inversionista", "inquilino", "propietario"];
export const MANAGEMENT_RESULTS = [
  "no respondio",
  "interesado",
  "quiere ver",
  "no le interesa",
];

export const emptyClient = {
  id: "",
  nombre: "",
  telefono: "",
  tipoCliente: "comprador",
  propiedadInteres: "",
  estado: "interesado",
  fechaUltimoContacto: "",
  fechaProximoContacto: "",
  gestiones: [],
};
