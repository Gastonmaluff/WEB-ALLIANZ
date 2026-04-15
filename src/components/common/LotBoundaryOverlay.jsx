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
  strokeColor = "#2B6D92",
  strokeWidth = 1.8,
  fillColor = "#2B6D92",
  fillOpacity = 0.18,
  animationDuration = 1.8,
  className = "",
  children,
}) {
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { once: animateOnce, margin: "-10% 0px -10% 0px" });
  const normalizedPoints = useMemo(() => normalizePolygonPoints(points), [points]);
  const pointsString = useMemo(() => polygonPointsToString(normalizedPoints), [normalizedPoints]);
  const pathD = useMemo(() => polygonPathD(normalizedPoints, closed), [normalizedPoints, closed]);
  const centroid = useMemo(() => polygonCentroid(normalizedPoints), [normalizedPoints]);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (!pathD) {
      setPathLength(0);
      return;
    }
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", pathD);
    try {
      const length = tempPath.getTotalLength();
      setPathLength(Number.isFinite(length) ? length : 0);
    } catch {
      setPathLength(0);
    }
  }, [pathD]);

  const resolvedLabelName = String(label?.name || labelTitle || label || "").trim();
  const resolvedLabelSurface = String(label?.surface || labelSubtitle || "").trim();
  const resolvedFillOpacity = Number.isFinite(Number(fillOpacity)) ? Number(fillOpacity) : 0.18;
  const resolvedDuration = Math.min(2, Math.max(1.5, Number(animationDuration) || 1.8));
  const shouldAnimate = animate && (trigger === "mount" || !animateOnView || inView);
  const lineDelay = shouldAnimate ? 0.05 : 0;
  const fillDelay = shouldAnimate ? resolvedDuration * 0.78 : 0;
  const labelDelay = shouldAnimate ? resolvedDuration * 0.92 : 0;
  const labelWidth = Math.max(30, Math.min(48, resolvedLabelName.length * 1.45));
  const hasSubtitle = Boolean(resolvedLabelSurface);
  const labelHeight = hasSubtitle ? 10.2 : 7.2;
  const centroidX = centroid ? centroid.x * 100 : 50;
  const centroidY = centroid ? centroid.y * 100 : 50;
  const labelX = Math.max(1, centroidX - labelWidth / 2);
  const labelY = Math.max(1, centroidY - labelHeight / 2);

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
      <img src={imageUrl} alt="Vista aerea del lote" className="absolute inset-0 h-full w-full object-cover" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none relative z-10 h-full w-full"
      >
        {closed && normalizedPoints.length > 2 ? (
          <>
            <motion.path
              d={pathD}
              fill={fillColor}
              fillOpacity={resolvedFillOpacity}
              initial={{ opacity: animate ? 0 : 1 }}
              animate={{ opacity: shouldAnimate ? 1 : animate ? 0 : 1 }}
              transition={{ duration: 0.48, delay: fillDelay, ease: "easeOut" }}
            />
            <motion.path
              d={pathD}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={
                animate
                  ? {
                      strokeDasharray: pathLength || 1,
                      strokeDashoffset: pathLength || 1,
                    }
                  : { strokeDasharray: pathLength || 1, strokeDashoffset: 0 }
              }
              animate={{
                strokeDasharray: pathLength || 1,
                strokeDashoffset: shouldAnimate ? 0 : animate ? pathLength || 1 : 0,
              }}
              transition={{ duration: resolvedDuration, delay: lineDelay, ease: [0.25, 0.1, 0.25, 1] }}
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
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        {showLabel && resolvedLabelName && centroid ? (
          <motion.g
            initial={animate ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: shouldAnimate ? 1 : animate ? 0 : 1, scale: shouldAnimate ? 1 : animate ? 0.98 : 1 }}
            transition={{ duration: 0.36, delay: labelDelay, ease: "easeOut" }}
            transform={`translate(${centroidX} ${centroidY})`}
          >
            <g transform={`translate(${-centroidX} ${-centroidY})`}>
              <rect
                x={labelX}
                y={labelY}
                width={labelWidth}
                height={labelHeight}
                rx="1.8"
                fill="rgba(4, 27, 44, 0.74)"
                stroke="rgba(198, 226, 244, 0.42)"
                strokeWidth="0.28"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={centroidX}
                y={hasSubtitle ? centroidY - 0.5 : centroidY + 1.25}
                fill="#EDF8FF"
                fontSize="2.5"
                textAnchor="middle"
                fontFamily="Manrope, sans-serif"
                letterSpacing="0.02em"
              >
                {resolvedLabelName}
              </text>
              {hasSubtitle ? (
                <text
                  x={centroidX}
                  y={centroidY + 2.35}
                  fill="#CEE5F5"
                  fontSize="1.9"
                  textAnchor="middle"
                  fontFamily="Manrope, sans-serif"
                  letterSpacing="0.03em"
                >
                  {resolvedLabelSurface}
                </text>
              ) : null}
            </g>
          </motion.g>
        ) : null}
      </svg>
      {children}
    </div>
  );
}

