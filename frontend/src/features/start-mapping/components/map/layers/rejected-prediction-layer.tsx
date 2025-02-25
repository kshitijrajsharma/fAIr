import {
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_SOURCE_ID,
} from "@/config";
import { Feature, GeoJSONType } from "@/types";
import { GeoJSONSource, Map } from "maplibre-gl";
import { useEffect, useMemo } from "react";

export const RejectedPredictionsLayer = ({
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

    map.addSource(REJECTED_MODEL_PREDICTIONS_SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    map.addLayer({
      id: REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      type: "fill",
      source: REJECTED_MODEL_PREDICTIONS_SOURCE_ID,
      paint: {
        "fill-color": "#D63F40",
        "fill-opacity": 0.2,
      },
      layout: { visibility: "visible" },
    });

    map.addLayer({
      id: REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      type: "line",
      source: REJECTED_MODEL_PREDICTIONS_SOURCE_ID,
      paint: {
        "line-color": "#D63F40",
        "line-width": 2,
      },
      layout: { visibility: "visible" },
    });
  }, [map]);

  useEffect(() => {
    if (!map || !features) return;
    const source = map.getSource(
      REJECTED_MODEL_PREDICTIONS_SOURCE_ID,
    ) as GeoJSONSource;
    if (source) {
      source.setData(geoJsonData as GeoJSONType);
    }
  }, [map, features]);

  return null;
};
