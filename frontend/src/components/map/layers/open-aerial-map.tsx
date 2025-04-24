import { Map } from "maplibre-gl";
import { TILE_BOUNDARY_LAYER_ID, TMS_LAYER_ID, TMS_SOURCE_ID } from "@/config";
import { useDynamicMapLayer } from "@/hooks/use-map-layer";

export const OpenAerialMap = ({
  tileJSONURL,
  map,
}: {
  tileJSONURL?: string;
  map: Map | null;
}) => {
  useDynamicMapLayer(
    map,
    TMS_SOURCE_ID,
    TMS_LAYER_ID,
    {
      type: "raster",
      url: tileJSONURL,
      tileSize: 256,
    },
    {
      id: TMS_LAYER_ID,
      type: "raster",
      source: TMS_SOURCE_ID,
      layout: { visibility: "visible" },
    },
    [tileJSONURL],
    tileJSONURL !== undefined && tileJSONURL?.length > 0,
    /**
     * Place the aerial imagery below the tile boundary layer.
     */
    [TILE_BOUNDARY_LAYER_ID],
  );
  return null;
};
