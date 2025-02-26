import PredictedFeatureActionPopup from "@/features/start-mapping/components/feature-popup";
import useScreenSize from "@/hooks/use-screen-size";
import { ControlsPosition } from "@/enums";
import { extractTileJSONURL, showErrorToast } from "@/utils";
import { LngLatBoundsLike, Map } from "maplibre-gl";
import { Legend } from "@/features/start-mapping/components";
import { MapComponent, MapCursorToolTip } from "@/components/map";
import { TOAST_NOTIFICATIONS } from "@/constants";
import { useToolTipVisibility } from "@/hooks/use-tooltip-visibility";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
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

export const StartMappingMapComponent = ({
  trainingDataset,
  modelPredictions,
  setModelPredictions,
  oamTileJSONIsError,
  oamTileJSON,
  modelPredictionsExist,
  map,
  mapContainerRef,
  currentZoom,
  layers,
  tmsBounds,
  trainingId,
  modelInfoRequestIsPending,
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
  currentZoom: number;
  mapContainerRef: RefObject<HTMLDivElement>;
  layers: {
    value: string;
    subLayers: string[];
  }[];
  tmsBounds: LngLatBoundsLike;
  modelInfoRequestIsPending: boolean;
}) => {
  const tileJSONURL = extractTileJSONURL(trainingDataset?.source_imagery ?? "");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const { isSmallViewport } = useScreenSize();

  const { tooltipPosition, tooltipVisible } = useToolTipVisibility(map, [
    currentZoom,
  ]);

  useEffect(() => {
    if (!oamTileJSONIsError) return;
    showErrorToast(undefined, TOAST_NOTIFICATIONS.trainingDataset.error);
  }, [oamTileJSONIsError]);

  useEffect(() => {
    if (!map || !tmsBounds || oamTileJSONIsError || modelInfoRequestIsPending)
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
  ]);

  useEffect(() => {
    if (!map) return;
    const layerIds = [
      ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
    ];
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const handleClick = (e: any) => {
      setShowPopup(true);
      setSelectedEvent(e);
      setSelectedFeature(e.features && e.features[0]);
    };

    layerIds.forEach((layerId) => {
      map.on("mouseenter", layerId, handleMouseEnter);
      map.on("mouseleave", layerId, handleMouseLeave);
      map.on("click", layerId, handleClick);
    });
    return () => {
      layerIds.forEach((layerId) => {
        map.off("mouseenter", layerId, handleMouseEnter);
        map.off("mouseleave", layerId, handleMouseLeave);
        map.off("click", layerId, handleClick);
      });
    };
  }, [map]);

  const showTooltip =
    currentZoom < MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION && tooltipVisible;

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
      {!modelInfoRequestIsPending &&
        <>
          <AcceptedPredictionsLayer
            map={map}
            features={modelPredictions.accepted}
          />
          <RejectedPredictionsLayer
            map={map}
            features={modelPredictions.rejected}
          />
          <AllPredictionsLayer map={map} features={modelPredictions.all} />
        </>}

      {showPopup && (
        <PredictedFeatureActionPopup
          event={selectedEvent}
          selectedFeature={selectedFeature}
          setModelPredictions={setModelPredictions}
          modelPredictions={modelPredictions}
          source_imagery={trainingDataset?.source_imagery as string}
          trainingId={trainingId}
          map={map}
        />
      )}
      <MapCursorToolTip
        tooltipVisible={showTooltip && !isSmallViewport}
        color={"bg-primary"}
        tooltipPosition={tooltipPosition}
      >
        {MINIMUM_ZOOM_LEVEL_INSTRUCTION_FOR_PREDICTION}
      </MapCursorToolTip>
      {map && modelPredictionsExist && !isSmallViewport && <Legend map={map} />}
    </MapComponent>
  );
};
