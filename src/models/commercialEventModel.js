export const COMMERCIAL_ACTION_TYPES = [
  "seguimiento",
  "llamada",
  "visita",
  "recordatorio",
];

export const COMMERCIAL_EVENT_STATUS = [
  "pendiente",
  "realizado",
  "reprogramado",
  "cancelado",
];

export const emptyCommercialEvent = {
  id: "",
  date: "",
  clientId: "",
  clientName: "",
  propertyRef: "",
  actionType: "seguimiento",
  assignedSeller: "",
  status: "pendiente",
  notes: "",
  createdAt: "",
  createdBy: "",
  updatedAt: "",
  updatedBy: "",
};
