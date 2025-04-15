import useScreenSize from "@/hooks/use-screen-size";
import {
  APPLICATION_ROUTES,
  START_MAPPING_PAGE_CONTENT,
  TOAST_NOTIFICATIONS,
} from "@/constants";
import { FitToBounds, LayerControl, ZoomLevel } from "@/components/map";
import { Head } from "@/components/seo";
import { LngLatBoundsLike } from "maplibre-gl";
import { ModelDetailsPopUp } from "@/features/start-mapping/components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { useGetTMSTileJSON } from "@/features/model-creation/hooks/use-tms-tilejson";
import { useMapInstance } from "@/hooks/use-map-instance";
import { useModelDetails } from "@/features/models/hooks/use-models";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { UserProfile } from "@/components/layouts";
import { Feature, TileJSON, TModelPredictions } from "@/types";
import {
  BrandLogoWithDropDown,
  Legend,
  StartMappingHeader,
  StartMappingMapComponent,
  StartMappingMobileDrawer,
} from "@/features/start-mapping/components";
import {
  extractTileJSONURL,
  geoJSONDowloader,
  openInJOSM,
  showSuccessToast,
} from "@/utils";
import {
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION,
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
  HOT_FAIR_MODEL_PREDICTIONS_LOCAL_STORAGE_KEY,
  PREDICTION_IMAGERY_SOURCE,
  PREDICTION_IMAGERY_LAYER_ID,
} from "@/config";
import { useLocalStorage } from "@/hooks/use-storage";
import { ImagerySourceSelector } from "@/features/start-mapping/components/replicable-models/imagery-source-selector";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { useDynamicMapLayer } from "@/hooks/use-map-layer";

export type TDownloadOptions = {
  name: string;
  value: string;
  onClick: () => void;
  showOnMobile: boolean;
}[];

export const SEARCH_PARAMS = {
  useJOSMQ: "useJOSMQ",
  confidenceLevel: "confidenceLevel",
  tolerance: "tolerance",
  area: "area",
};

export type TQueryParams = { [x: string]: string | number | boolean };

export const StartMappingPage = () => {
  const { modelId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { map, mapContainerRef, currentZoom } = useMapInstance();
  const { isSmallViewport } = useScreenSize();

  const navigate = useNavigate();

  /**
   * State to manage the tile server URL for the prediction imagery.
   */
  const [predictionImageryURL, setPredictionImageryURL] = useState<
    string | undefined
  >(undefined);

  const [customTileServerURL, setCustomTileServerURL] = useState<string>("");

  const [predictionImagerySource, setPredictionImagerySource] =
    useState<PredictionImagerySource>(PredictionImagerySource.ModelDefault);

  const [showModelDetailsPopup, setShowModelDetailsPopup] =
    useState<boolean>(false);

  const [isImagerySelectorOpen, setImagerySelectorOpen] =
    useState<boolean>(false);

  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();

  const {
    isError,
    isPending: modelInfoRequestIspending,
    data: modelInfo,
    error,
  } = useModelDetails(modelId as string, !!modelId);

  const tileJSONURL = useMemo(
    () =>
      modelInfo?.dataset?.source_imagery
        ? extractTileJSONURL(modelInfo?.dataset?.source_imagery)
        : undefined,
    [modelInfo?.dataset?.source_imagery],
  );

  const { data: oamTileJSON, isError: oamTileJSONIsError } = useGetTMSTileJSON(
    tileJSONURL as string,
    !!tileJSONURL,
  );

  /**
   * Set the prediction imagery to the model info's source imagery
   * when the model info is available and the prediction imagery is not set.
   * This is to ensure that the map is displayed with the correct imagery.
   */
  useEffect(() => {
    if (modelInfo?.dataset?.source_imagery) {
      setPredictionImageryURL(modelInfo.dataset.source_imagery);
    }
  }, [modelInfo?.dataset?.source_imagery]);

  /**
   * Navigate to the not found page if there is an error
   * while fetching the model info.
   */
  useEffect(() => {
    if (isError) {
      navigate(APPLICATION_ROUTES.NOTFOUND, {
        state: {
          from: window.location.pathname,
          // @ts-expect-error: might not be typed
          error: error?.response?.data?.detail,
        },
      });
    }
  }, [isError, error, navigate]);

  const [query, setQuery] = useState<TQueryParams>(() => {
    return {
      [SEARCH_PARAMS.useJOSMQ]:
        searchParams.get(SEARCH_PARAMS.useJOSMQ) || true,
      [SEARCH_PARAMS.confidenceLevel]:
        searchParams.get(SEARCH_PARAMS.confidenceLevel) || 50,
      [SEARCH_PARAMS.tolerance]:
        searchParams.get(SEARCH_PARAMS.tolerance) || 0.3,
      [SEARCH_PARAMS.area]: searchParams.get(SEARCH_PARAMS.area) || 3,
    };
  });
  const { setValue, getValue } = useLocalStorage();

  const emptyPredictionState = {
    accepted: [],
    rejected: [],
    all: [],
  };
  const [modelPredictions, setModelPredictions] = useState<TModelPredictions>(
    () => {
      const savedPredictions = getValue(
        HOT_FAIR_MODEL_PREDICTIONS_LOCAL_STORAGE_KEY(modelId as string),
      );
      return savedPredictions
        ? JSON.parse(savedPredictions)
        : emptyPredictionState;
    },
  );

  useEffect(() => {
    setValue(
      HOT_FAIR_MODEL_PREDICTIONS_LOCAL_STORAGE_KEY(modelId as string),
      JSON.stringify(modelPredictions),
    );
  }, [modelPredictions, modelId]);

  const modelPredictionsExist = useMemo(() => {
    return (
      modelPredictions.accepted.length > 0 ||
      modelPredictions.rejected.length > 0 ||
      modelPredictions.all.length > 0
    );
  }, [modelPredictions]);

  const updateQuery = useCallback(
    (newParams: TQueryParams) => {
      // Merge the new query values
      setQuery((prev) => ({ ...prev, ...newParams }));

      // Update the URLSearchParams
      const updatedParams = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(newParams)) {
        if (value !== undefined && value !== null) {
          updatedParams.set(key, String(value));
        } else {
          updatedParams.delete(key);
        }
      }
      setSearchParams(updatedParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const disablePrediction =
    currentZoom < MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION;

  const popupAnchorId = "model-details";
  const imagerySourceSelectorAnchorId = "imagery-source-selector";

  const mapLayers = useMemo(
    () => [
      ...(modelPredictions.accepted.length > 0
        ? [
            {
              value:
                START_MAPPING_PAGE_CONTENT.map.controls.legendControl
                  .acceptedPredictions,
              subLayers: [
                ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
                ACCEPTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
              ],
            },
          ]
        : []),
      ...(modelPredictions.rejected.length > 0
        ? [
            {
              value:
                START_MAPPING_PAGE_CONTENT.map.controls.legendControl
                  .rejectedPredictions,
              subLayers: [
                REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
                REJECTED_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
              ],
            },
          ]
        : []),
      ...(modelPredictions.all.length > 0
        ? [
            {
              value:
                START_MAPPING_PAGE_CONTENT.map.controls.legendControl
                  .predictionResults,
              subLayers: [
                ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
                ALL_MODEL_PREDICTIONS_OUTLINE_LAYER_ID,
              ],
            },
          ]
        : []),
    ],
    [modelPredictions],
  );

  const handleAllFeaturesDownload = useCallback(async () => {
    geoJSONDowloader(
      {
        type: "FeatureCollection",
        features: [
          ...modelPredictions.accepted,
          ...modelPredictions.rejected,
          ...modelPredictions.all,
        ],
      },
      `all_predictions_${modelInfo.dataset.id}`,
    );
    showSuccessToast(TOAST_NOTIFICATIONS.startMapping.fileDownloadSuccess);
  }, [modelPredictions, modelInfo]);

  const handleAcceptedFeaturesDownload = useCallback(async () => {
    geoJSONDowloader(
      { type: "FeatureCollection", features: modelPredictions.accepted },
      `accepted_predictions_${modelInfo.dataset.id}`,
    );
    showSuccessToast(TOAST_NOTIFICATIONS.startMapping.fileDownloadSuccess);
  }, [modelPredictions, modelInfo]);

  const handleFeaturesDownloadToJOSM = useCallback(
    (features: Feature[]) => {
      if (!map || !modelInfo?.dataset) return;
      openInJOSM(
        modelInfo.dataset.name,
        modelInfo.dataset.source_imagery,
        features,
        true,
      );
    },
    [map, modelInfo],
  );

  const handleAllFeaturesDownloadToJOSM = useCallback(() => {
    handleFeaturesDownloadToJOSM(modelPredictions.all);
  }, [handleFeaturesDownloadToJOSM, modelPredictions.all]);

  const handleAcceptedFeaturesDownloadToJOSM = useCallback(() => {
    handleFeaturesDownloadToJOSM(modelPredictions.accepted);
  }, [handleFeaturesDownloadToJOSM, modelPredictions.accepted]);

  const downloadOptions: TDownloadOptions = [
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options.allFeatures(
        isSmallViewport ? "All" : "Download all",
      ),
      value: START_MAPPING_PAGE_CONTENT.buttons.download.options.allFeatures(
        isSmallViewport ? "All" : "Download all",
      ),
      onClick: handleAllFeaturesDownload,
      showOnMobile: true,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options.acceptedFeatures(
        isSmallViewport ? "Accepted" : "Download accepted",
      ),
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options.acceptedFeatures(
          isSmallViewport ? "Accepted" : "Download accepted",
        ),
      onClick: handleAcceptedFeaturesDownload,
      showOnMobile: true,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options
        .openAllFeaturesInJOSM,
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options
          .openAllFeaturesInJOSM,
      onClick: handleAllFeaturesDownloadToJOSM,
      showOnMobile: false,
    },
    {
      name: START_MAPPING_PAGE_CONTENT.buttons.download.options
        .openAcceptedFeaturesInJOSM,
      value:
        START_MAPPING_PAGE_CONTENT.buttons.download.options
          .openAcceptedFeaturesInJOSM,
      onClick: handleAcceptedFeaturesDownloadToJOSM,
      showOnMobile: false,
    },
  ];

  const handleModelDetailsPopup = useCallback(() => {
    setShowModelDetailsPopup((prev) => !prev);
  }, [setShowModelDetailsPopup]);

  const handleImagerySourceSelectorTriggerButtonClick = useCallback(() => {
    setImagerySelectorOpen((prev) => !prev);
  }, [setImagerySelectorOpen]);

  const clearPredictions = useCallback(() => {
    setModelPredictions(emptyPredictionState);
  }, [setModelPredictions]);

  /**
   * Dynamic layer for the prediction imagery.
   */
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
  );

  const memoizedPredictionImagerySource = useMemo(() => {
    if (!isImagerySelectorOpen) return null;
    return (
      <ImagerySourceSelector
        showPopup={isImagerySelectorOpen}
        anchor={imagerySourceSelectorAnchorId}
        setPredictionImageryURL={setPredictionImageryURL}
        predictionImagerySource={predictionImagerySource}
        setPredictionImagerySource={setPredictionImagerySource}
        modelDefaultImageryURL={modelInfo?.dataset?.source_imagery}
        customTileServerURL={customTileServerURL}
        setCustomTileServerURL={setCustomTileServerURL}
      />
    );
  }, [
    isImagerySelectorOpen,
    imagerySourceSelectorAnchorId,
    setPredictionImageryURL,
    predictionImagerySource,
    setPredictionImagerySource,
    customTileServerURL,
    setCustomTileServerURL,
  ]);

  return (
    <>
      <Head title={START_MAPPING_PAGE_CONTENT.pageTitle(modelInfo?.name)} />
      <div className="h-screen flex flex-col fullscreen">
        {/* Mobile dialog */}
        <StartMappingMobileDrawer
          isOpen={isSmallViewport}
          disablePrediction={disablePrediction}
          setModelPredictions={setModelPredictions}
          modelPredictions={modelPredictions}
          map={map}
          handleModelDetailsPopup={handleModelDetailsPopup}
          downloadOptions={downloadOptions}
          query={query}
          updateQuery={updateQuery}
          modelDetailsPopupIsActive={showModelDetailsPopup}
          clearPredictions={clearPredictions}
          currentZoom={currentZoom}
          modelInfo={modelInfo}
        />
        <div className="sticky top-0 bg-white z-10 px-4 xl:px-large py-1 hidden md:block">
          {/* Model Details Popover */}
          {showModelDetailsPopup && (
            <ModelDetailsPopUp
              showPopup={showModelDetailsPopup}
              handlePopup={handleModelDetailsPopup}
              closeMobileDrawer={() => setShowModelDetailsPopup(false)}
              anchor={popupAnchorId}
              modelInfo={modelInfo}
              modelInfoRequestIsPending={modelInfoRequestIspending}
              modelInfoRequestIsError={isError}
            />
          )}

          {/* Imagery Source Selector Popover */}
          {memoizedPredictionImagerySource}
          {/* Web Header */}
          <StartMappingHeader
            modelInfo={modelInfo}
            modelInfoRequestIsPending={modelInfoRequestIspending}
            modelPredictionsExist={modelPredictionsExist}
            modelInfoRequestIsError={isError}
            modelPredictions={modelPredictions}
            query={query}
            updateQuery={updateQuery}
            setModelPredictions={setModelPredictions}
            map={map}
            disablePrediction={disablePrediction}
            popupAnchorId={popupAnchorId}
            imagerySourceSelectorAnchorId={imagerySourceSelectorAnchorId}
            modelDetailsPopupIsActive={showModelDetailsPopup}
            handleModelDetailsPopup={handleModelDetailsPopup}
            downloadOptions={downloadOptions}
            clearPredictions={clearPredictions}
            currentZoom={currentZoom}
            handleImagerySourceSelectorTriggerButtonClick={
              handleImagerySourceSelectorTriggerButtonClick
            }
            isImagerySelectorOpen={isImagerySelectorOpen}
          />
        </div>
        <div className="col-span-12 h-[70vh] md:h-full md:border-8 md:border-off-white flex-grow relative map-elements-z-index">
          {/* Mobile Header and Map Controls */}
          <div className="md:hidden">
            <div className="absolute top-4 right-4  z-[10]">
              <UserProfile hideFullName />
            </div>
            <div className="absolute top-4 left-4  z-[10]">
              <BrandLogoWithDropDown
                onClose={onDropdownHide}
                onShow={onDropdownShow}
                isOpened={dropdownIsOpened}
              />
            </div>
            <div className="absolute top-[10vh] right-4 z-[2] flex flex-col gap-y-4 items-end">
              <ZoomLevel currentZoom={currentZoom} />
              <LayerControl
                layers={mapLayers}
                map={map}
                openAerialMap
                basemaps
              />
            </div>
            <div className="absolute bottom-[30vh] flex flex-col gap-y-4 right-4 z-[1] items-end">
              <FitToBounds bounds={oamTileJSON?.bounds} map={map} />
              <div>{map && modelPredictionsExist && <Legend map={map} />}</div>
            </div>
          </div>
          {/* Map Component */}
          <StartMappingMapComponent
            trainingDataset={modelInfo?.dataset}
            modelPredictions={modelPredictions}
            setModelPredictions={setModelPredictions}
            oamTileJSONIsError={oamTileJSONIsError}
            oamTileJSON={oamTileJSON as TileJSON}
            modelPredictionsExist={modelPredictionsExist}
            mapContainerRef={mapContainerRef}
            map={map}
            currentZoom={currentZoom}
            layers={mapLayers}
            tmsBounds={oamTileJSON?.bounds as LngLatBoundsLike}
            trainingId={modelInfo?.published_training}
            modelInfoRequestIsPending={modelInfoRequestIspending}
            predictionImagerySource={predictionImagerySource}
          />
        </div>
      </div>
    </>
  );
};
