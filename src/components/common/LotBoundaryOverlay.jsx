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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const normalizedPoints = useMemo(() => normalizePolygonPoints(points), [points]);
  const transformedPoints = useMemo(() => {
    const cw = Number(containerSize.width || 0);
    const ch = Number(containerSize.height || 0);
    const iw = Number(imageNaturalSize.width || 0);
    const ih = Number(imageNaturalSize.height || 0);

    if (!cw || !ch || !iw || !ih) return normalizedPoints;

    const scale = Math.max(cw / iw, ch / ih);
    const renderedWidth = iw * scale;
    const renderedHeight = ih * scale;
    const offsetX = (cw - renderedWidth) / 2;
    const offsetY = (ch - renderedHeight) / 2;

    const scaleXPercent = renderedWidth / cw;
    const scaleYPercent = renderedHeight / ch;
    const offsetXPercent = (offsetX / cw) * 100;
    const offsetYPercent = (offsetY / ch) * 100;

    return normalizedPoints.map((point) => ({
      x: offsetXPercent + point.x * scaleXPercent,
      y: offsetYPercent + point.y * scaleYPercent,
    }));
  }, [normalizedPoints, imageNaturalSize.width, imageNaturalSize.height, containerSize.width, containerSize.height]);
  const pointsString = useMemo(() => polygonPointsToString(transformedPoints), [transformedPoints]);
  const pathD = useMemo(() => polygonPathD(transformedPoints, closed), [transformedPoints, closed]);
  const centroid = useMemo(() => polygonCentroid(transformedPoints), [transformedPoints]);
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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const target = rootRef.current;
    if (!target) return undefined;

    const syncSize = () => {
      const rect = target.getBoundingClientRect();
      setContainerSize({
        width: rect.width || 0,
        height: rect.height || 0,
      });
    };

    syncSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncSize);
      return () => window.removeEventListener("resize", syncSize);
    }

    const observer = new ResizeObserver(() => syncSize());
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!imageUrl || typeof window === "undefined") {
      setImageNaturalSize({ width: 0, height: 0 });
      return undefined;
    }

    let active = true;
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => {
      if (!active) return;
      setImageNaturalSize({
        width: image.naturalWidth || 0,
        height: image.naturalHeight || 0,
      });
    };
    image.onerror = () => {
      if (!active) return;
      setImageNaturalSize({ width: 0, height: 0 });
    };
    image.src = imageUrl;

    return () => {
      active = false;
    };
  }, [imageUrl]);

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
