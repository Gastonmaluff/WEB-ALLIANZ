export function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function toTitle(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatOperationLabel(value) {
  if (!value) return "";
  if (value === "venta_o_alquiler") return "Venta o alquiler";
  if (value === "venta") return "Venta";
  if (value === "alquiler") return "Alquiler";
  return toTitle(value.replaceAll("_", " "));
}
