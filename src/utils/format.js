export function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function slugify(value) {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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

export function buildPropertyWhatsappUrl(property) {
  return `https://wa.me/595981000000?text=${encodeURIComponent(
    `Hola Allianz, me interesa la propiedad ${property?.titulo || ""} (${property?.ubicacion || ""}).`
  )}`;
}
