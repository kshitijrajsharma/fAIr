import useScreenSize from "@/hooks/use-screen-size";
import { ControlsPosition } from "@/enums";
import { extractTileJSONURL, showErrorToast } from "@/utils";
import { LngLatBoundsLike, Map, Popup } from "maplibre-gl";
import { Legend, PredictedFeatureActionPopup } from "@/features/start-mapping/components";
import { MapComponent, MapCursorToolTip } from "@/components/map";
import { TOAST_NOTIFICATIONS } from "@/constants";
import {
  Dispatch,
  memo,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  TileJSON,
  TModelPredictionFeature,
  TModelPredictions,
  TTrainingDataset,
} from "@/types";
import {
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION,
  MINIMUM_ZOOM_LEVEL_INSTRUCTION_FOR_PREDICTION,
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
} from "@/config";
import bbox from "@turf/bbox";
import {
  AcceptedPredictionsLayer,
  RejectedPredictionsLayer,
  AllPredictionsLayer,
} from "@/features/start-mapping/components/map/layers";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { PredictionImageryLayer } from "./layers/prediction-imagery-layer";
import { useModelPredictionStore } from "@/store/model-prediction-store";


export const StartMappingMapComponent = ({
  trainingDataset,
  modelPredictions,
  setModelPredictions,
  oamTileJSONIsError,
  oamTileJSON,
  modelPredictionsExist,
  map,
  mapContainerRef,
  layers,
  tmsBounds,
  trainingId,
  modelInfoRequestIsPending,
  predictionImagerySource,
  predictionImageryURL,
  currentZoom
}: {
  trainingId: number;
  trainingDataset?: TTrainingDataset;
  modelPredictions: TModelPredictions;

  setModelPredictions: Dispatch<
    SetStateAction<{
      all: TModelPredictionFeature[];
      accepted: TModelPredictionFeature[];
      rejected: TModelPredictionFeature[];
    }>
  >;

  oamTileJSONIsError: boolean;
  oamTileJSON: TileJSON;
  modelPredictionsExist: boolean;
  map: Map | null;
  mapContainerRef: RefObject<HTMLDivElement>;
  layers: {
    value: string;
    subLayers: string[];
  }[];
  tmsBounds: LngLatBoundsLike;
  modelInfoRequestIsPending: boolean;
  predictionImagerySource: PredictionImagerySource;
  predictionImageryURL: string | undefined;
  currentZoom: number;

}) => {
  const tileJSONURL = extractTileJSONURL(trainingDataset?.source_imagery ?? "");
  const { isSmallViewport } = useScreenSize();
  const memoizedModelPredictions = useMemo(() => modelPredictions, [modelPredictions]);



  useEffect(() => {
    if (!oamTileJSONIsError) return;
    showErrorToast(undefined, TOAST_NOTIFICATIONS.trainingDataset.error);
  }, [oamTileJSONIsError]);

  console.log('rerendered map')
  useEffect(() => {
    if (
      !map ||
      !tmsBounds ||
      oamTileJSONIsError ||
      modelInfoRequestIsPending ||
      /**
       * Zoom to the bounds of the tileJSON if the user has not selected the default model imagery.
       */
      predictionImagerySource !== PredictionImagerySource.ModelDefault
    )
      return;

    // if there are predictions that the user hasn't interacted with, zoom to them.
    if (modelPredictions.all.length > 0) {
      // get the bbox of the features with turf.
      map.fitBounds(
        bbox({
          type: "FeatureCollection",
          features: modelPredictions.all,
        }) as LngLatBoundsLike,
      );
    } else {
      map.fitBounds(tmsBounds);
    }
  }, [
    map,
    tmsBounds,
    oamTileJSONIsError,
    oamTileJSON,
    modelInfoRequestIsPending,
    predictionImagerySource,
  ]);

  const shouldShowTooltip =
    currentZoom < MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION;

  const memoizedToolTip = useMemo(() => {
    if (!map) return null;

    return (
      <MapCursorToolTip
        color="bg-primary"
        map={map}
        currentZoom={currentZoom}
        showTooltip={shouldShowTooltip}
      >
        {MINIMUM_ZOOM_LEVEL_INSTRUCTION_FOR_PREDICTION}
      </MapCursorToolTip>
    );
  }, [map, currentZoom]);


  return (
    <MapComponent
      controlsPosition={ControlsPosition.TOP_LEFT}
      showTileBoundaries
      fitToBounds={!isSmallViewport}
      bounds={tmsBounds}
      mapContainerRef={mapContainerRef}
      currentZoom={currentZoom}
      map={map}
      zoomControls={!isSmallViewport}
      layerControl={!isSmallViewport}
      layerControlLayers={layers}
      basemaps
      showCurrentZoom={!isSmallViewport}
      openAerialMap={!modelInfoRequestIsPending}
      oamTileJSONURL={tileJSONURL}
    >
      {map && predictionImageryURL && (
        <PredictionImageryLayer
          map={map}
          predictionImagerySource={predictionImagerySource}
          predictionImageryURL={predictionImageryURL}
        />
      )}
      {map && (
        <PredictedFeatureActionPopup
          setModelPredictions={setModelPredictions}
          modelPredictions={modelPredictions}
          source_imagery={trainingDataset?.source_imagery as string}
          trainingId={trainingId}
          map={map}
        />
      )}

      {!modelInfoRequestIsPending && map && (
        <PredictionLayers map={map} modelPredictions={memoizedModelPredictions} />
      )}
      {memoizedToolTip}
      {map && modelPredictionsExist && !isSmallViewport && <Legend map={map} />}
    </MapComponent>
  );
};


const PredictionLayers = memo(({ map, modelPredictions }: {
  map: Map | null;
  modelPredictions: {
    all: TModelPredictionFeature[];
    accepted: TModelPredictionFeature[];
    rejected: TModelPredictionFeature[];
  };
}) => (
  <>
    <AcceptedPredictionsLayer map={map} features={modelPredictions.accepted} />
    <RejectedPredictionsLayer map={map} features={modelPredictions.rejected} />
    <AllPredictionsLayer map={map} features={modelPredictions.all} />
  </>
));


