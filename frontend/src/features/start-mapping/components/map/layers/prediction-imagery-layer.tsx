import {
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  PREDICTION_IMAGERY_LAYER_ID,
  PREDICTION_IMAGERY_SOURCE,
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  TILE_BOUNDARY_LAYER_ID,
} from "@/config";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { useDynamicMapLayer } from "@/hooks/use-map-layer";
import { Map } from "maplibre-gl";

const extractSchemeFromURL = (url: string): "tms" | "xyz" => {
  if (url.includes("{z}/{x}/{y}")) {
    return "xyz";
  } else if (url.includes("{z}/{y}/{x}")) {
    return "tms";
  }
  throw new Error("Unknown tile scheme in URL");
};

export const PredictionImageryLayer = ({
  map,
  predictionImageryURL,
  predictionImagerySource,
}: {
  map: Map | null;
  predictionImageryURL: string | undefined;
  predictionImagerySource: PredictionImagerySource;
}) => {
  const scheme = predictionImageryURL
    ? extractSchemeFromURL(predictionImageryURL)
    : "tms";

  useDynamicMapLayer(
    map,
    `${PREDICTION_IMAGERY_SOURCE}-${predictionImagerySource}`,
    `${PREDICTION_IMAGERY_LAYER_ID}-${predictionImagerySource}`,
    {
      type: "raster",
      tiles: [predictionImageryURL as string],
      scheme: scheme,
      tileSize: 256,
    },
    {
      id: `${PREDICTION_IMAGERY_LAYER_ID}-${predictionImagerySource}`,
      type: "raster",
      source: `${PREDICTION_IMAGERY_SOURCE}-${predictionImagerySource}`,
      layout: {
        visibility: "visible",
      },
    },
    [predictionImageryURL, predictionImagerySource],
    predictionImageryURL !== undefined &&
      predictionImageryURL?.length > 0 &&
      predictionImagerySource !== PredictionImagerySource.ModelDefault,
    /**
     * Place the prediction imagery layer below the prediction layers and also tile boundary layer.
     */
    [
      ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
      TILE_BOUNDARY_LAYER_ID,
    ],
  );
  return null;
};
