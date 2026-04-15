import { useMemo, useState } from "react";
import { clampPercentage, normalizePolygonPoints, polygonPointsToString } from "../../utils/polygon";

export const LOT_EDITOR_MODE = {
  add: "add",
  move: "move",
  delete: "delete",
};

function getPointerCoordinates(event, currentTarget) {
  const rect = currentTarget.getBoundingClientRect();
  const x = clampPercentage(((event.clientX - rect.left) / rect.width) * 100);
  const y = clampPercentage(((event.clientY - rect.top) / rect.height) * 100);
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
}

function ToolButton({ children, active = false, disabled = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial transition ${
        active
          ? "border-[#041B2C] bg-[#041B2C] text-white"
          : "border-stone bg-white text-ink hover:border-ink"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

export function LotBoundaryEditor({
  imageUrl,
  points = [],
  closed = false,
  strokeColor = "#7DD3FC",
  strokeWidth = 0.75,
  fillColor = "#50BEFF",
  fillOpacity = 0.18,
  mode = LOT_EDITOR_MODE.add,
  onModeChange,
  onChange,
  onRequestImageUpload,
  onRequestSave,
  onTogglePreview,
  previewVisible = true,
  isSaving = false,
}) {
  const normalizedPoints = useMemo(() => normalizePolygonPoints(points), [points]);
  const [draggingPointId, setDraggingPointId] = useState("");

  const updatePoints = (nextPoints, nextClosed = closed) => {
    onChange?.({
      points: normalizePolygonPoints(nextPoints),
      closed: nextClosed,
    });
  };

  const addPoint = (event) => {
    if (!imageUrl || closed || mode !== LOT_EDITOR_MODE.add) return;
    const coords = getPointerCoordinates(event, event.currentTarget);
    const next = [...normalizedPoints, { id: `pt-${Date.now()}`, ...coords }];
    updatePoints(next, false);
  };

  const startDrag = (pointId) => (event) => {
    if (mode !== LOT_EDITOR_MODE.move) return;
    event.stopPropagation();
    setDraggingPointId(pointId);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const endDrag = () => {
    setDraggingPointId("");
  };

  const onPointerMove = (event) => {
    if (!draggingPointId || mode !== LOT_EDITOR_MODE.move) return;
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

  const onPointClick = (pointId) => (event) => {
    event.stopPropagation();
    if (mode === LOT_EDITOR_MODE.delete) removePoint(pointId);
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
  const cursorClass = mode === LOT_EDITOR_MODE.add ? "cursor-crosshair" : "cursor-default";
  const pointCursor =
    mode === LOT_EDITOR_MODE.move
      ? "cursor-grab active:cursor-grabbing"
      : mode === LOT_EDITOR_MODE.delete
      ? "cursor-not-allowed"
      : "cursor-pointer";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <ToolButton onClick={onRequestImageUpload}>Subir imagen</ToolButton>
        <ToolButton active={mode === LOT_EDITOR_MODE.add} onClick={() => onModeChange?.(LOT_EDITOR_MODE.add)}>
          Agregar puntos
        </ToolButton>
        <ToolButton active={mode === LOT_EDITOR_MODE.move} onClick={() => onModeChange?.(LOT_EDITOR_MODE.move)}>
          Mover puntos
        </ToolButton>
        <ToolButton active={mode === LOT_EDITOR_MODE.delete} onClick={() => onModeChange?.(LOT_EDITOR_MODE.delete)}>
          Eliminar punto
        </ToolButton>
        <ToolButton onClick={closePolygon} disabled={closed || normalizedPoints.length < 3}>
          Cerrar poligono
        </ToolButton>
        <ToolButton onClick={reopenPolygon} disabled={!closed}>
          Reabrir
        </ToolButton>
        <ToolButton onClick={clearPolygon} disabled={!normalizedPoints.length}>
          Reiniciar
        </ToolButton>
        <ToolButton onClick={onTogglePreview} active={previewVisible}>
          Vista previa
        </ToolButton>
        <ToolButton onClick={onRequestSave} disabled={!imageUrl || isSaving}>
          {isSaving ? "Guardando..." : "Guardar delimitacion"}
        </ToolButton>
      </div>

      <div className="relative overflow-hidden border border-stone bg-[#0A2032]">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Editor de delimitacion del lote" className="h-full w-full object-cover" />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className={`absolute inset-0 h-full w-full ${cursorClass}`}
              onClick={addPoint}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
            >
              {closed && normalizedPoints.length > 2 ? (
                <polygon
                  points={pointsString}
                  fill={fillColor}
                  fillOpacity={fillOpacity}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                />
              ) : normalizedPoints.length > 1 ? (
                <polyline
                  points={pointsString}
                  fill="transparent"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
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
                    className={pointCursor}
                    onPointerDown={startDrag(point.id)}
                    onClick={onPointClick(point.id)}
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

      <div className="hidden space-y-2 lg:block">
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
    </div>
  );
}
