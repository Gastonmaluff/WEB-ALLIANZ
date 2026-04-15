import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  normalizePolygonPoints,
  polygonCentroid,
  polygonPathD,
  polygonPointsToString,
} from "../../utils/polygon";

export function LotBoundaryOverlay({
  imageUrl,
  points = [],
  closed = true,
  label = "",
  labelTitle = "",
  labelSubtitle = "",
  showLabel = true,
  animate = true,
  trigger = "viewport",
  animateOnView = true,
  animateOnce = true,
  replayIntervalMs = 0,
  strokeColor = "#7DD3FC",
  strokeWidth = 0.75,
  fillColor = "#50BEFF",
  fillOpacity = 0.18,
  animationDuration = 1.35,
  className = "",
  children,
}) {
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { once: animateOnce, margin: "-10% 0px -10% 0px" });
  const [replayTick, setReplayTick] = useState(0);
  const normalizedPoints = useMemo(() => normalizePolygonPoints(points), [points]);
  const pointsString = useMemo(() => polygonPointsToString(normalizedPoints), [normalizedPoints]);
  const pathD = useMemo(() => polygonPathD(normalizedPoints, closed), [normalizedPoints, closed]);
  const centroid = useMemo(() => polygonCentroid(normalizedPoints), [normalizedPoints]);
  const resolvedLabelTitle = String(labelTitle || label || "").trim();
  const resolvedLabelSubtitle = String(labelSubtitle || "").trim();
  const resolvedFillOpacity = Number.isFinite(Number(fillOpacity))
    ? Number(fillOpacity)
    : 0.18;
  const shouldAnimate =
    animate &&
    (trigger === "mount" || !animateOnView || inView);
  const canReplay =
    animate &&
    Number(replayIntervalMs) > 0 &&
    closed &&
    normalizedPoints.length > 2 &&
    (trigger === "mount" || !animateOnView || inView);

  useEffect(() => {
    if (!canReplay) return undefined;
    const intervalId = window.setInterval(() => {
      setReplayTick((current) => current + 1);
    }, Number(replayIntervalMs));
    return () => window.clearInterval(intervalId);
  }, [canReplay, replayIntervalMs]);

  if (!imageUrl) {
    return (
      <div className={`relative overflow-hidden border-fine bg-surface ${className}`}>
        <div className="flex h-full min-h-48 items-center justify-center px-4 py-10 text-center text-sm text-slate">
          Carga una imagen aerea para visualizar la delimitacion del lote.
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative overflow-hidden border-fine bg-[#0A2032] ${className}`}>
      <img src={imageUrl} alt="Vista aerea del lote" className="h-full w-full object-cover" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {closed && normalizedPoints.length > 2 ? (
          <>
            <motion.path
              key={`lot-fill-${replayTick}`}
              d={pathD}
              fill={fillColor}
              fillOpacity={resolvedFillOpacity}
              initial={{ opacity: animate ? 0 : 0.8 }}
              animate={{ opacity: shouldAnimate ? 1 : animate ? 0 : 1 }}
              transition={{ duration: Math.max(0.22, Number(animationDuration) * 0.32), delay: shouldAnimate ? Math.max(0.35, Number(animationDuration) * 0.8) : 0 }}
            />
            <motion.path
              key={`lot-stroke-${replayTick}`}
              d={pathD}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
              animate={{ pathLength: shouldAnimate ? 1 : animate ? 0 : 1 }}
              transition={{ duration: Math.max(0.6, Number(animationDuration) || 1.35), ease: "easeInOut" }}
            />
          </>
        ) : normalizedPoints.length > 1 ? (
          <polyline
            points={pointsString}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {showLabel && resolvedLabelTitle && centroid ? (
          <g>
            <rect
              x={Math.max(1, centroid.x - 12)}
              y={Math.max(1, centroid.y - (resolvedLabelSubtitle ? 5.2 : 3.5))}
              width="24"
              height={resolvedLabelSubtitle ? "9.8" : "7"}
              rx="1.8"
              fill="rgba(3, 18, 31, 0.82)"
              stroke={strokeColor}
              strokeWidth="0.25"
            />
            <text
              x={centroid.x}
              y={resolvedLabelSubtitle ? centroid.y - 0.2 : centroid.y + 1.1}
              fill="#E6F7FF"
              fontSize="2.7"
              textAnchor="middle"
              fontFamily="Manrope, sans-serif"
              letterSpacing="0.02em"
            >
              {resolvedLabelTitle}
            </text>
            {resolvedLabelSubtitle ? (
              <text
                x={centroid.x}
                y={centroid.y + 2.2}
                fill="#CDEBFA"
                fontSize="1.95"
                textAnchor="middle"
                fontFamily="Manrope, sans-serif"
                letterSpacing="0.03em"
              >
                {resolvedLabelSubtitle}
              </text>
            ) : null}
          </g>
        ) : null}
      </svg>
      {children}
    </div>
  );
}
