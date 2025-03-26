import {
  MIN_ZOOM_LEVEL_FOR_TRAINING_AREA_LABELS,
  TRAINING_AREAS_AOI_LABELS_FILL_COLOR,
  TRAINING_AREAS_AOI_LABELS_FILL_OPACITY,
  TRAINING_AREAS_AOI_LABELS_OUTLINE_COLOR,
  TRAINING_AREAS_AOI_LABELS_OUTLINE_WIDTH,
} from "@/config";
import { Feature, GeoJSONType } from "@/types";
import { GeoJSONSource, Map } from "maplibre-gl";
import { useEffect, useMemo } from "react";

export const TrainingAreasLabelsLayers = ({
  map,
  features,
  trainingAreasLabelsSourceId,
  trainingAreasLabelsOutlineLayerId,
  trainingAreasLabelsFillLayerId,
}: {
  map: Map | null;
  features?: Feature[];
  trainingAreasLabelsOutlineLayerId: string;
  trainingAreasLabelsSourceId: string;
  trainingAreasLabelsFillLayerId: string;
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

    if (!map.getSource(trainingAreasLabelsSourceId)) {
      map.addSource(trainingAreasLabelsSourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!map.getLayer(trainingAreasLabelsFillLayerId)) {
      map.addLayer({
        id: trainingAreasLabelsFillLayerId,
        type: "fill",
        source: trainingAreasLabelsSourceId,

        minzoom: MIN_ZOOM_LEVEL_FOR_TRAINING_AREA_LABELS - 2,
        paint: {
          "fill-color": TRAINING_AREAS_AOI_LABELS_FILL_COLOR,
          "fill-opacity": TRAINING_AREAS_AOI_LABELS_FILL_OPACITY,
        },
        layout: { visibility: "visible" },
      });
    }
    if (!map.getLayer(trainingAreasLabelsOutlineLayerId)) {
      map.addLayer({
        id: trainingAreasLabelsOutlineLayerId,
        type: "line",
        source: trainingAreasLabelsSourceId,
        minzoom: MIN_ZOOM_LEVEL_FOR_TRAINING_AREA_LABELS - 2,
        paint: {
          "line-color": TRAINING_AREAS_AOI_LABELS_OUTLINE_COLOR,
          "line-width": TRAINING_AREAS_AOI_LABELS_OUTLINE_WIDTH,
        },
        layout: { visibility: "visible" },
      });
    }
  }, [map]);

  useEffect(() => {
    if (!map || !features) return;
    const source = map.getSource(trainingAreasLabelsSourceId) as GeoJSONSource;
    if (source) {
      source.setData(geoJsonData as GeoJSONType);
    }
  }, [map, geoJsonData]);

  return null;
};
