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
