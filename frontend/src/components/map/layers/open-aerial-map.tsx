import { Map } from "maplibre-gl";
import { TMS_LAYER_ID, TMS_SOURCE_ID } from "@/config";
import { useEffect } from "react";

export const OpenAerialMap = ({
  tileJSONURL,
  map,
}: {
  tileJSONURL?: string;
  map: Map | null;
}) => {
  useEffect(() => {
    if (!map) return;
    if (!map.getSource(TMS_SOURCE_ID)) {
      map.addSource(TMS_SOURCE_ID, {
        type: "raster",
        url: tileJSONURL,
        tileSize: 256,
      });
    }
    if (!map.getLayer(TMS_LAYER_ID)) {
      map.addLayer({
        id: TMS_LAYER_ID,
        type: "raster",
        source: TMS_SOURCE_ID,
        layout: { visibility: "visible" },
      });
    }
  }, [map]);

  return null;
};
