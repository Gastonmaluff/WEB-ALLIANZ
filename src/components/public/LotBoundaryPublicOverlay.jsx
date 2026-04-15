import { LotBoundaryOverlay } from "../common/LotBoundaryOverlay";

export function LotBoundaryPublicOverlay({
  overlay,
  className = "",
  trigger,
  animateOnView,
  animateOnce,
  replayIntervalMs = 0,
}) {
  const resolvedAnimateOnView = animateOnView ?? overlay?.animateOnView ?? true;
  const resolvedAnimateOnce = animateOnce ?? overlay?.animateOnce ?? true;
  const resolvedTrigger = trigger ?? (resolvedAnimateOnView ? "viewport" : "mount");

  return (
    <LotBoundaryOverlay
      imageUrl={overlay?.imageUrl}
      points={overlay?.points || []}
      closed={Boolean(overlay?.closed)}
      label={overlay?.label || ""}
      labelTitle={overlay?.labelTitle || ""}
      labelSubtitle={overlay?.labelSubtitle || ""}
      showLabel={overlay?.showLabel !== false}
      strokeColor={overlay?.strokeColor}
      strokeWidth={overlay?.strokeWidth}
      fillColor={overlay?.fillColor}
      fillOpacity={overlay?.fillOpacity}
      animate={overlay?.animate !== false}
      animationDuration={overlay?.animationDuration}
      animateOnView={resolvedAnimateOnView}
      animateOnce={resolvedAnimateOnce}
      trigger={resolvedTrigger}
      replayIntervalMs={replayIntervalMs}
      className={className}
    />
  );
}
