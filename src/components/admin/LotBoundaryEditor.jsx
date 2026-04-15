import { useMemo, useRef, useState } from "react";
import { clampPercentage, normalizePolygonPoints, polygonPointsToString } from "../../utils/polygon";

export const LOT_EDITOR_MODE = {
  add: "add",
  move: "move",
  delete: "delete",
};

const CLOSE_DISTANCE_THRESHOLD = 0.024;
const DUPLICATE_POINT_THRESHOLD = 0.005;
const QUICK_CLICK_GUARD_MS = 90;

function getPointerCoordinates(event, currentTarget) {
  const rect = currentTarget.getBoundingClientRect();
  if (!rect.width || !rect.height) return { x: 0, y: 0 };
  const x = clampPercentage((event.clientX - rect.left) / rect.width);
  const y = clampPercentage((event.clientY - rect.top) / rect.height);
  return {
    x: Number(x.toFixed(4)),
    y: Number(y.toFixed(4)),
  };
}

function distanceBetweenPoints(a, b) {
  if (!a || !b) return Number.MAX_SAFE_INTEGER;
  const deltaX = a.x - b.x;
  const deltaY = a.y - b.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
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
  strokeColor = "#2B6D92",
  strokeWidth = 1.8,
  fillColor = "#2B6D92",
  fillOpacity = 0.18,
  mode = LOT_EDITOR_MODE.add,
  onModeChange,
  onChange,
  onRequestImageUpload,
  onRequestSave,
  onTogglePreview,
  previewVisible = true,
  isSaving = false,
  isUploading = false,
}) {
  const normalizedPoints = useMemo(() => normalizePolygonPoints(points), [points]);
  const [draggingPointId, setDraggingPointId] = useState("");
  const [selectedPointId, setSelectedPointId] = useState("");
  const [pulsePointId, setPulsePointId] = useState("");
  const lastAddTimestampRef = useRef(0);

  const updatePoints = (nextPoints, nextClosed = closed) => {
    onChange?.({
      points: normalizePolygonPoints(nextPoints),
      closed: nextClosed,
    });
  };

  const closePolygonWithConfirmation = () => {
    if (normalizedPoints.length < 3 || closed) return;
    const confirmClose = window.confirm(
      "Estas por cerrar el poligono. Luego podras reabrirlo si necesitas ajustar vertices. Continuar?"
    );
    if (!confirmClose) return;
    updatePoints(normalizedPoints, true);
  };

  const addPoint = (event) => {
    if (!imageUrl || closed || mode !== LOT_EDITOR_MODE.add) return;

    const now = Date.now();
    if (now - lastAddTimestampRef.current < QUICK_CLICK_GUARD_MS) return;
    lastAddTimestampRef.current = now;

    const coords = getPointerCoordinates(event, event.currentTarget);
    const firstPoint = normalizedPoints[0];

    if (firstPoint && normalizedPoints.length >= 3) {
      const nearStart = distanceBetweenPoints(coords, firstPoint) <= CLOSE_DISTANCE_THRESHOLD;
      if (nearStart) {
        closePolygonWithConfirmation();
        return;
      }
    }

    const lastPoint = normalizedPoints[normalizedPoints.length - 1];
    if (lastPoint && distanceBetweenPoints(coords, lastPoint) <= DUPLICATE_POINT_THRESHOLD) {
      return;
    }

    const pointId = `pt-${Date.now()}`;
    const next = [...normalizedPoints, { id: pointId, ...coords }];
    setSelectedPointId(pointId);
    setPulsePointId(pointId);
    window.setTimeout(() => setPulsePointId((current) => (current === pointId ? "" : current)), 260);
    updatePoints(next, false);
  };

  const startDrag = (pointId) => (event) => {
    if (mode !== LOT_EDITOR_MODE.move) return;
    event.stopPropagation();
    setSelectedPointId(pointId);
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

  const reopenPolygon = () => {
    updatePoints(normalizedPoints, false);
  };

  const clearPolygon = () => {
    if (!normalizedPoints.length) return;
    const confirmReset = window.confirm("Se eliminara toda la delimitacion actual. Deseas continuar?");
    if (!confirmReset) return;
    setSelectedPointId("");
    updatePoints([], false);
  };

  const removePoint = (pointId) => {
    const next = normalizedPoints.filter((point) => point.id !== pointId);
    setSelectedPointId((current) => (current === pointId ? "" : current));
    updatePoints(next, next.length > 2 && closed);
  };

  const removeLastPoint = () => {
    if (!normalizedPoints.length) return;
    const pointToRemove = normalizedPoints[normalizedPoints.length - 1];
    removePoint(pointToRemove.id);
  };

  const onPointClick = (pointId, index) => (event) => {
    event.stopPropagation();
    setSelectedPointId(pointId);

    if (mode === LOT_EDITOR_MODE.delete) {
      removePoint(pointId);
      return;
    }

    const isFirst = index === 0;
    if (mode === LOT_EDITOR_MODE.add && isFirst && normalizedPoints.length >= 3 && !closed) {
      closePolygonWithConfirmation();
    }
  };

  const updatePointValue = (pointId, axis, rawValue) => {
    const numeric = clampPercentage(Number(rawValue) / 100);
    const value = Number(numeric.toFixed(4));
    setSelectedPointId(pointId);
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
        <ToolButton onClick={closePolygonWithConfirmation} disabled={closed || normalizedPoints.length < 3}>
          Cerrar poligono
        </ToolButton>
        <ToolButton onClick={reopenPolygon} disabled={!closed}>
          Reabrir
        </ToolButton>
        <ToolButton onClick={removeLastPoint} disabled={!normalizedPoints.length}>
          Eliminar ultimo punto
        </ToolButton>
        <ToolButton onClick={clearPolygon} disabled={!normalizedPoints.length}>
          Reiniciar delimitacion
        </ToolButton>
        <ToolButton onClick={onTogglePreview} active={previewVisible}>
          Vista previa
        </ToolButton>
        <ToolButton onClick={onRequestSave} disabled={!imageUrl || isSaving || isUploading}>
          {isSaving ? "Guardando..." : "Guardar delimitacion"}
        </ToolButton>
      </div>

      <div className="rounded-sm border border-stone bg-[#F6F8FA] px-3 py-2 text-[11px] uppercase tracking-editorial text-slate">
        Click para agregar puntos. Arrastra para ajustar. Cierra el poligono tocando el punto inicial.
      </div>

      <div className="relative overflow-hidden border border-stone bg-[#0A2032]">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Editor de delimitacion del lote"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
              className={`relative z-10 aspect-[16/10] w-full ${cursorClass}`}
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
                  vectorEffect="non-scaling-stroke"
                />
              ) : normalizedPoints.length > 1 ? (
                <polyline
                  points={pointsString}
                  fill="transparent"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}

              {normalizedPoints.map((point, index) => {
                const isSelected = selectedPointId === point.id;
                const isFirst = index === 0;
                const isPulse = pulsePointId === point.id;
                const cx = point.x * 100;
                const cy = point.y * 100;

                return (
                  <g key={point.id}>
                    {isPulse ? (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="1.8"
                        fill="none"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="0.35"
                        vectorEffect="non-scaling-stroke"
                        className="animate-ping"
                      />
                    ) : null}

                    {isFirst ? (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? "1.45" : "1.2"}
                        fill="none"
                        stroke="#EAF6FF"
                        strokeWidth={isSelected ? "0.5" : "0.4"}
                        vectorEffect="non-scaling-stroke"
                      />
                    ) : null}

                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? "1.06" : "0.88"}
                      fill={isFirst ? "#D9EDF9" : "#0D2F44"}
                      stroke={isSelected ? "#F0FAFF" : "#CBE7F8"}
                      strokeWidth={isSelected ? "0.45" : "0.28"}
                      vectorEffect="non-scaling-stroke"
                      className={pointCursor}
                      onPointerDown={startDrag(point.id)}
                      onClick={onPointClick(point.id, index)}
                    />
                  </g>
                );
              })}
            </svg>
          </>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-8 text-center text-sm text-slate">
            <p>Carga una imagen para comenzar la delimitacion visual del lote.</p>
            <ToolButton onClick={onRequestImageUpload}>Subir imagen aerea</ToolButton>
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
              value={Number((point.x * 100).toFixed(2))}
              onChange={(event) => updatePointValue(point.id, "x", event.target.value)}
              className="w-full border border-stone bg-white px-2 py-1.5 text-xs outline-none focus:border-ink"
              title="Coordenada X (%)"
            />
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={Number((point.y * 100).toFixed(2))}
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

