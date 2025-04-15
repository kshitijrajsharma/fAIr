import { useToolTipVisibility } from "@/hooks/use-tooltip-visibility";
import { Map } from "maplibre-gl";

export const MapCursorToolTip = ({
  color = "bg-black",
  map,
  currentZoom,
  showTooltip,
  children,
  dependencies,
}: {
  color?: string;
  map: Map | null;
  currentZoom: number;
  showTooltip: boolean;
  children: React.ReactNode;
  dependencies?: any[];
}) => {
  const { tooltipPosition, tooltipVisible } = useToolTipVisibility(map, [
    currentZoom,
    ...(dependencies || []),
  ]);

  return (
    <div
      className={`absolute w-50 text-white px-2 pointer-events-none text-nowrap rounded-lg shadow-2xl flex flex-col ${color}`}
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }}
    >
      {showTooltip && tooltipVisible && children}
    </div>
  );
};
