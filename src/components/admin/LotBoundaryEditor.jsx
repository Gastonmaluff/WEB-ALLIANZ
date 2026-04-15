import { useMemo, useState } from "react";
import { clampPercentage, normalizePolygonPoints, polygonPointsToString } from "../../utils/polygon";

function getPointerCoordinates(event, currentTarget) {
  const rect = currentTarget.getBoundingClientRect();
  const x = clampPercentage(((event.clientX - rect.left) / rect.width) * 100);
  const y = clampPercentage(((event.clientY - rect.top) / rect.height) * 100);
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
}

export function LotBoundaryEditor({ imageUrl, points = [], closed = false, onChange }) {
  const normalizedPoints = useMemo(() => normalizePolygonPoints(points), [points]);
  const [draggingPointId, setDraggingPointId] = useState("");

  const updatePoints = (nextPoints, nextClosed = closed) => {
    onChange?.({
      points: normalizePolygonPoints(nextPoints),
      closed: nextClosed,
    });
  };

  const addPoint = (event) => {
    if (!imageUrl || closed) return;
    const coords = getPointerCoordinates(event, event.currentTarget);
    const next = [...normalizedPoints, { id: `pt-${Date.now()}`, ...coords }];
    updatePoints(next, false);
  };

  const startDrag = (pointId) => (event) => {
    event.stopPropagation();
    setDraggingPointId(pointId);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const endDrag = () => {
    setDraggingPointId("");
  };

  const onPointerMove = (event) => {
    if (!draggingPointId) return;
    const coords = getPointerCoordinates(event, event.currentTarget);
    updatePoints(
      normalizedPoints.map((point) => (point.id === draggingPointId ? { ...point, ...coords } : point)),
      closed
    );
  };

  const closePolygon = () => {
    if (normalizedPoints.length < 3) return;
    updatePoints(normalizedPoints, true);
  };

  const reopenPolygon = () => {
    updatePoints(normalizedPoints, false);
  };

  const clearPolygon = () => {
    updatePoints([], false);
  };

  const removePoint = (pointId) => {
    const next = normalizedPoints.filter((point) => point.id !== pointId);
    updatePoints(next, next.length > 2 && closed);
  };

  const updatePointValue = (pointId, axis, rawValue) => {
    const numeric = clampPercentage(rawValue);
    const value = Number(numeric.toFixed(2));
    updatePoints(
      normalizedPoints.map((point) => (point.id === pointId ? { ...point, [axis]: value } : point)),
      closed
    );
  };

  const pointsString = polygonPointsToString(normalizedPoints);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden border border-stone bg-[#0A2032]">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Editor de delimitacion del lote" className="h-full w-full object-cover" />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full cursor-crosshair"
              onClick={addPoint}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
            >
              {closed && normalizedPoints.length > 2 ? (
                <polygon
                  points={pointsString}
                  fill="rgba(80, 190, 255, 0.16)"
                  stroke="#7DD3FC"
                  strokeWidth="0.75"
                  strokeLinejoin="round"
                />
              ) : normalizedPoints.length > 1 ? (
                <polyline
                  points={pointsString}
                  fill="transparent"
                  stroke="#7DD3FC"
                  strokeWidth="0.75"
                  strokeLinejoin="round"
                />
              ) : null}

              {normalizedPoints.map((point, index) => (
                <g key={point.id}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="1.35"
                    fill="#03121F"
                    stroke="#E0F2FE"
                    strokeWidth="0.35"
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={startDrag(point.id)}
                    onClick={(event) => event.stopPropagation()}
                  />
                  <text
                    x={point.x + 1.6}
                    y={point.y - 1.1}
                    fill="#E0F2FE"
                    fontSize="2.3"
                    fontFamily="Manrope, sans-serif"
                  >
                    {index + 1}
                  </text>
                </g>
              ))}
            </svg>
          </>
        ) : (
          <div className="flex h-56 items-center justify-center px-5 text-center text-sm text-slate">
            Carga una imagen para comenzar a marcar vertices del lote.
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={closePolygon}
          disabled={closed || normalizedPoints.length < 3}
          className="border border-stone bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-ink transition enabled:hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cerrar poligono
        </button>
        <button
          type="button"
          onClick={reopenPolygon}
          disabled={!closed}
          className="border border-stone bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-ink transition enabled:hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reabrir
        </button>
        <button
          type="button"
          onClick={clearPolygon}
          disabled={!normalizedPoints.length}
          className="border border-[#7A2A2A]/35 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial text-[#7A2A2A] transition enabled:hover:border-[#7A2A2A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpiar todo
        </button>
      </div>

      {normalizedPoints.length ? (
        <div className="space-y-2">
          {normalizedPoints.map((point, index) => (
            <div
              key={`point-row-${point.id}`}
              className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2 border border-stone bg-surface px-3 py-2"
            >
              <span className="text-xs font-semibold text-slate">{index + 1}</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={point.x}
                onChange={(event) => updatePointValue(point.id, "x", event.target.value)}
                className="w-full border border-stone bg-white px-2 py-1.5 text-xs outline-none focus:border-ink"
                title="Coordenada X (%)"
              />
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={point.y}
                onChange={(event) => updatePointValue(point.id, "y", event.target.value)}
                className="w-full border border-stone bg-white px-2 py-1.5 text-xs outline-none focus:border-ink"
                title="Coordenada Y (%)"
              />
              <button
                type="button"
                onClick={() => removePoint(point.id)}
                className="border border-[#7A2A2A]/35 bg-white px-2 py-1.5 text-[10px] font-semibold uppercase tracking-editorial text-[#7A2A2A] transition hover:border-[#7A2A2A]"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
