import { LotBoundaryOverlay } from "../common/LotBoundaryOverlay";

export function LotBoundaryPreview({ overlay, className = "" }) {
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
      animateOnView={overlay?.animateOnView !== false}
      animateOnce={overlay?.animateOnce !== false}
      trigger={overlay?.animateOnView !== false ? "viewport" : "mount"}
      className={className}
    />
  );
}
