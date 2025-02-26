import { Map } from "maplibre-gl";
import {
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  TMS_LAYER_ID,
  TMS_SOURCE_ID,
} from "@/config";
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
    /**
          * Move all the layers above the OAM.
          * This is needed incase the user reloads the page on the start mapping page
          * and there are existing predictions in their local storage.
          */

    const layers = [
      ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
    ];
    layers.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.moveLayer(TMS_LAYER_ID, layerId,);
      }
    });
  }, [map, tileJSONURL]);

  return null;
};
