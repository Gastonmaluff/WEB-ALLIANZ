import { useMemo, useRef } from "react";
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
  showLabel = true,
  animate = true,
  trigger = "viewport",
  className = "",
  children,
}) {
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { once: true, margin: "-10% 0px -10% 0px" });
  const normalizedPoints = useMemo(() => normalizePolygonPoints(points), [points]);
  const pointsString = useMemo(() => polygonPointsToString(normalizedPoints), [normalizedPoints]);
  const pathD = useMemo(() => polygonPathD(normalizedPoints, closed), [normalizedPoints, closed]);
  const centroid = useMemo(() => polygonCentroid(normalizedPoints), [normalizedPoints]);
  const shouldAnimate = animate && (trigger === "mount" || inView);

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
              d={pathD}
              fill="rgba(80, 190, 255, 0.18)"
              initial={{ opacity: animate ? 0 : 0.8 }}
              animate={{ opacity: shouldAnimate ? 1 : animate ? 0 : 1 }}
              transition={{ duration: 0.45, delay: shouldAnimate ? 1.2 : 0 }}
            />
            <motion.path
              d={pathD}
              fill="transparent"
              stroke="#7DD3FC"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
              animate={{ pathLength: shouldAnimate ? 1 : animate ? 0 : 1 }}
              transition={{ duration: 1.35, ease: "easeInOut" }}
            />
          </>
        ) : normalizedPoints.length > 1 ? (
          <polyline
            points={pointsString}
            fill="transparent"
            stroke="#7DD3FC"
            strokeWidth="0.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {showLabel && label && centroid ? (
          <g>
            <rect
              x={Math.max(1, centroid.x - 12)}
              y={Math.max(1, centroid.y - 3.5)}
              width="24"
              height="7"
              rx="1.8"
              fill="rgba(3, 18, 31, 0.82)"
              stroke="rgba(125, 211, 252, 0.5)"
              strokeWidth="0.25"
            />
            <text
              x={centroid.x}
              y={centroid.y + 1.1}
              fill="#E6F7FF"
              fontSize="2.7"
              textAnchor="middle"
              fontFamily="Manrope, sans-serif"
              letterSpacing="0.02em"
            >
              {label}
            </text>
          </g>
        ) : null}
      </svg>
      {children}
    </div>
  );
}
