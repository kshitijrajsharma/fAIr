import {
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  PREDICTION_IMAGERY_LAYER_ID,
  PREDICTION_IMAGERY_SOURCE,
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
} from "@/config";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { useDynamicMapLayer } from "@/hooks/use-map-layer";
import { Map } from "maplibre-gl";

export const PredictionImageryLayer = ({
  map,
  predictionImageryURL,
  predictionImagerySource,
}: {
  map: Map | null;
  predictionImageryURL: string | undefined;
  predictionImagerySource: PredictionImagerySource;
}) => {
  useDynamicMapLayer(
    map,
    PREDICTION_IMAGERY_SOURCE,
    PREDICTION_IMAGERY_LAYER_ID,
    {
      type: "raster",
      tiles: [predictionImageryURL as string],
      tileSize: 256,
    },
    {
      id: PREDICTION_IMAGERY_LAYER_ID,
      type: "raster",
      source: PREDICTION_IMAGERY_SOURCE,
      layout: {
        visibility: "visible",
      },
    },
    [predictionImageryURL, predictionImagerySource],
    predictionImageryURL !== undefined &&
      predictionImageryURL?.length > 0 &&
      predictionImagerySource !== PredictionImagerySource.ModelDefault,
    /**
     * Place the prediction imagery layer below the prediction layers.
     */
    [
      ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
    ],
  );
  return null;
};
