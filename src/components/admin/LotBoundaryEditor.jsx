import { useMemo, useState } from "react";
import { clampPercentage, normalizePolygonPoints, polygonPointsToString } from "../../utils/polygon";

export const LOT_EDITOR_MODE = {
  add: "add",
  delete: "delete",
};

const CLOSE_THRESHOLD = 2.6;

function getPointerCoordinates(event, currentTarget) {
  const rect = currentTarget.getBoundingClientRect();
  const x = clampPercentage(((event.clientX - rect.left) / rect.width) * 100);
  const y = clampPercentage(((event.clientY - rect.top) / rect.height) * 100);
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
}

function getDistance(a, b) {
  const dx = Number(a?.x || 0) - Number(b?.x || 0);
  const dy = Number(a?.y || 0) - Number(b?.y || 0);
  return Math.sqrt(dx * dx + dy * dy);
}

function ToolButton({
  children,
  active = false,
  disabled = false,
  primary = false,
  onClick,
}) {
  const className = primary
    ? "min-w-[172px] border-[#041B2C] bg-[#041B2C] px-5 py-2.5 text-[12px] text-white shadow-[0_8px_24px_-14px_rgba(4,27,44,0.9)] hover:bg-[#163649]"
    : active
    ? "border-[#041B2C] bg-[#041B2C] text-white"
    : "border-stone bg-white text-ink hover:border-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border px-3 py-2 text-[11px] font-semibold uppercase tracking-editorial transition ${className} disabled:cursor-not-allowed disabled:opacity-50`}
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
  onRequestSave,
  onRequestPreview,
  isSaving = false,
  saveState = "idle",
}) {
  const normalizedPoints = useMemo(() => normalizePolygonPoints(points), [points]);
  const [draggingPointId, setDraggingPointId] = useState("");
  const [selectedPointId, setSelectedPointId] = useState("");
  const [pulsePointId, setPulsePointId] = useState("");

  const updatePoints = (nextPoints, nextClosed = closed) => {
    onChange?.({
      points: normalizePolygonPoints(nextPoints),
      closed: nextClosed,
    });
  };

  const closePolygon = () => {
    if (closed || normalizedPoints.length < 3) return;
    updatePoints(normalizedPoints, true);
  };

  const addPoint = (event) => {
    if (!imageUrl || mode !== LOT_EDITOR_MODE.add || closed) return;
    const coords = getPointerCoordinates(event, event.currentTarget);
    const firstPoint = normalizedPoints[0];
    if (firstPoint && normalizedPoints.length >= 3 && getDistance(coords, firstPoint) <= CLOSE_THRESHOLD) {
      closePolygon();
      return;
    }

    const nextPointId = `pt-${Date.now()}`;
    const next = [...normalizedPoints, { id: nextPointId, ...coords }];
    setSelectedPointId(nextPointId);
    setPulsePointId(nextPointId);
    window.setTimeout(() => setPulsePointId((current) => (current === nextPointId ? "" : current)), 260);
    updatePoints(next, false);
  };

  const startDrag = (pointId) => (event) => {
    if (mode === LOT_EDITOR_MODE.delete || closed) return;
    event.stopPropagation();
    setSelectedPointId(pointId);
    setDraggingPointId(pointId);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const endDrag = () => {
    setDraggingPointId("");
  };

  const onPointerMove = (event) => {
    if (!draggingPointId || mode === LOT_EDITOR_MODE.delete || closed) return;
    const coords = getPointerCoordinates(event, event.currentTarget);
    updatePoints(
      normalizedPoints.map((point) => (point.id === draggingPointId ? { ...point, ...coords } : point)),
      closed
    );
  };

  const reopenPolygon = () => {
    updatePoints(normalizedPoints, false);
  };

  const clearPolygon = () => {
    if (!normalizedPoints.length) return;
    const confirmed = window.confirm("Se va a reiniciar la delimitacion. Queres continuar?");
    if (!confirmed) return;
    setSelectedPointId("");
    updatePoints([], false);
  };

  const removePoint = (pointId) => {
    const next = normalizedPoints.filter((point) => point.id !== pointId);
    setSelectedPointId((current) => (current === pointId ? "" : current));
    updatePoints(next, next.length > 2 && closed);
  };

  const onPointClick = (pointId, index) => (event) => {
    event.stopPropagation();
    setSelectedPointId(pointId);
    if (mode === LOT_EDITOR_MODE.delete) {
      removePoint(pointId);
      return;
    }
    const isFirstPoint = index === 0;
    if (!closed && isFirstPoint && normalizedPoints.length >= 3) {
      closePolygon();
    }
  };

  const updatePointValue = (pointId, axis, rawValue) => {
    const numeric = clampPercentage(rawValue);
    const value = Number(numeric.toFixed(2));
    setSelectedPointId(pointId);
    updatePoints(
      normalizedPoints.map((point) => (point.id === pointId ? { ...point, [axis]: value } : point)),
      closed
    );
  };

  const pointsString = polygonPointsToString(normalizedPoints);
  const cursorClass = mode === LOT_EDITOR_MODE.add ? "cursor-crosshair" : "cursor-not-allowed";

  const saveLabel = isSaving
    ? "Guardando..."
    : saveState === "success"
    ? "Delimitacion guardada"
    : saveState === "error"
    ? "Reintentar guardado"
    : "Guardar delimitacion";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <ToolButton active={mode === LOT_EDITOR_MODE.add} onClick={() => onModeChange?.(LOT_EDITOR_MODE.add)}>
          Agregar puntos
        </ToolButton>
        <ToolButton active={mode === LOT_EDITOR_MODE.delete} onClick={() => onModeChange?.(LOT_EDITOR_MODE.delete)}>
          Eliminar punto
        </ToolButton>
        <ToolButton onClick={reopenPolygon} disabled={!closed}>
          Reabrir
        </ToolButton>
        <ToolButton onClick={clearPolygon} disabled={!normalizedPoints.length}>
          Reiniciar
        </ToolButton>
        <ToolButton onClick={onRequestPreview} disabled={!imageUrl || normalizedPoints.length < 3}>
          Vista previa
        </ToolButton>
        <ToolButton primary onClick={onRequestSave} disabled={!imageUrl || isSaving}>
          {saveLabel}
        </ToolButton>
      </div>

      <div className="rounded-sm border border-stone bg-surface px-3 py-2 text-[11px] uppercase tracking-editorial text-slate">
        Click para agregar puntos. Arrastra para ajustar. Cierra el poligono tocando el punto inicial.
      </div>

      <div className="relative aspect-[16/10] overflow-hidden border border-stone bg-[#0A2032]">
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
              onPointerCancel={endDrag}
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

              {normalizedPoints.map((point, index) => {
                const isFirst = index === 0;
                const isSelected = selectedPointId === point.id;
                const isPulsing = pulsePointId === point.id;

                return (
                  <g key={point.id}>
                    {isPulsing ? (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="1.9"
                        fill="none"
                        stroke="#E0F2FE"
                        strokeWidth="0.3"
                        className="animate-ping"
                      />
                    ) : null}
                    {isFirst ? (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isSelected ? "1.55" : "1.3"}
                        fill="none"
                        stroke="#E0F2FE"
                        strokeWidth={isSelected ? "0.45" : "0.35"}
                      />
                    ) : null}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isSelected ? "1.08" : "0.92"}
                      fill={isFirst ? "#D9ECF9" : "#03121F"}
                      stroke="#E0F2FE"
                      strokeWidth={isSelected ? "0.45" : "0.33"}
                      className={mode === LOT_EDITOR_MODE.delete ? "cursor-not-allowed" : "cursor-pointer"}
                      onPointerDown={startDrag(point.id)}
                      onClick={onPointClick(point.id, index)}
                    />
                    <text
                      x={point.x + 1.4}
                      y={point.y - 1}
                      fill="#E0F2FE"
                      fontSize="2.15"
                      fontFamily="Manrope, sans-serif"
                    >
                      {index + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </>
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center text-sm text-slate">
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
