export function clampPercentage(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric));
}

function normalizePointCoordinate(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  // Compatibilidad: puntos antiguos estaban en 0..100.
  if (Math.abs(numeric) > 1) {
    return numeric / 100;
  }
  return numeric;
}

export function normalizePolygonPoints(points) {
  if (!Array.isArray(points)) return [];
  return points
    .map((point, index) => ({
      id: point?.id || `pt-${Date.now()}-${index}`,
      x: clampPercentage(normalizePointCoordinate(point?.x)),
      y: clampPercentage(normalizePointCoordinate(point?.y)),
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

export function polygonPointsToString(points) {
  return normalizePolygonPoints(points)
    .map((point) => `${point.x * 100},${point.y * 100}`)
    .join(" ");
}

export function polygonPathD(points, closed = true) {
  const normalized = normalizePolygonPoints(points);
  if (!normalized.length) return "";
  const commands = normalized.map((point, index) =>
    `${index === 0 ? "M" : "L"} ${point.x * 100} ${point.y * 100}`
  );
  if (closed && normalized.length > 2) commands.push("Z");
  return commands.join(" ");
}

export function polygonCentroid(points) {
  const normalized = normalizePolygonPoints(points);
  if (!normalized.length) return null;
  const total = normalized.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );
  return {
    x: total.x / normalized.length,
    y: total.y / normalized.length,
  };
}
