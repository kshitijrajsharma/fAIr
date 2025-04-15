import {
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ALL_MODEL_PREDICTIONS_SOURCE_ID,
} from "@/config";
import { Feature, GeoJSONType } from "@/types";
import { GeoJSONSource, Map } from "maplibre-gl";
import { useEffect, useMemo } from "react";

type AllPredictionsLayerProps = {
  map: Map | null;
  features: Feature[];
};

export const AllPredictionsLayer = ({
  map,
  features,
}: AllPredictionsLayerProps) => {
  const geoJsonData = useMemo(
    () => ({
      type: "FeatureCollection",
      features: features,
    }),
    [features],
  );

  useEffect(() => {
    if (!map || !map.getStyle()) return;
    if (!map.getSource(ALL_MODEL_PREDICTIONS_SOURCE_ID)) {
      map.addSource(ALL_MODEL_PREDICTIONS_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    if (!map.getLayer(ALL_MODEL_PREDICTIONS_FILL_LAYER_ID)) {
      map.addLayer({
        id: ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
        type: "fill",
        source: ALL_MODEL_PREDICTIONS_SOURCE_ID,
        paint: {
          "fill-color": "#A243DC",
          "fill-opacity": 0.2,
        },
        layout: { visibility: "visible" },
      });
    }

    if (!map.getLayer(ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
        type: "line",
        source: ALL_MODEL_PREDICTIONS_SOURCE_ID,
        paint: {
          "line-color": "#A243DC",
          "line-width": 2,
        },
        layout: { visibility: "visible" },
      });
    }
  }, [map]);

  useEffect(() => {
    if (!map || !features || !map.getStyle()) return;
    const source = map.getSource(
      ALL_MODEL_PREDICTIONS_SOURCE_ID,
    ) as GeoJSONSource;
    if (source) {
      source.setData(geoJsonData as GeoJSONType);
    }
  }, [map, geoJsonData]);

  return null;
};
