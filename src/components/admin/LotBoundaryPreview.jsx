import { LotBoundaryOverlay } from "../common/LotBoundaryOverlay";

export function LotBoundaryPreview({ overlay, className = "", replayToken = 0 }) {
  const forceMountReplay = Number.isFinite(Number(replayToken));
  return (
    <LotBoundaryOverlay
      key={`lot-boundary-preview-${replayToken}`}
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
      animateOnView={forceMountReplay ? false : overlay?.animateOnView !== false}
      animateOnce={forceMountReplay ? false : overlay?.animateOnce !== false}
      trigger={forceMountReplay ? "mount" : overlay?.animateOnView !== false ? "viewport" : "mount"}
      className={className}
    />
  );
}
