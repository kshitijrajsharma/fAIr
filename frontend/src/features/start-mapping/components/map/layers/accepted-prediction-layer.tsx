import {
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_SOURCE_ID,
} from "@/config";
import { Feature, GeoJSONType } from "@/types";
import { GeoJSONSource, Map } from "maplibre-gl";
import { useEffect, useMemo } from "react";

export const AcceptedPredictionsLayer = ({
  map,
  features,
}: {
  map: Map | null;
  features: Feature[];
}) => {
  const geoJsonData = useMemo(
    () => ({
      type: "FeatureCollection",
      features: features,
    }),
    [features],
  );

  useEffect(() => {
    if (!map) return;
    if (!map.getSource(ACCEPTED_MODEL_PREDICTIONS_SOURCE_ID)) {
      map.addSource(ACCEPTED_MODEL_PREDICTIONS_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!map.getLayer(ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID)) {
      map.addLayer({
        id: ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
        type: "fill",
        source: ACCEPTED_MODEL_PREDICTIONS_SOURCE_ID,
        paint: {
          "fill-color": "#23C16B",
          "fill-opacity": 0.2,
        },
        layout: { visibility: "visible" },
      });
    }
    if (!map.getLayer(ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
        type: "line",
        source: ACCEPTED_MODEL_PREDICTIONS_SOURCE_ID,
        paint: {
          "line-color": "#23C16B",
          "line-width": 2,
        },
        layout: { visibility: "visible" },
      });
    }
  }, [map]);

  useEffect(() => {
    if (!map || !features) return;
    const source = map.getSource(
      ACCEPTED_MODEL_PREDICTIONS_SOURCE_ID,
    ) as GeoJSONSource;
    if (source) {
      source.setData(geoJsonData as GeoJSONType);
    }
  }, [map, geoJsonData]);

  return null;
};
