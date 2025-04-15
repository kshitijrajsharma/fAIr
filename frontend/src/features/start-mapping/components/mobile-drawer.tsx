import ModelAction from "@/features/start-mapping/components/model-action";
import { ChevronDownIcon, CloudDownloadIcon } from "@/components/ui/icons";
import { Map } from "maplibre-gl";
import {
  MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION,
  MINIMUM_ZOOM_LEVEL_INSTRUCTION_FOR_PREDICTION,
} from "@/config";
import { MobileDrawer } from "@/components/ui/drawer";
import { ModelDetailsTriggerButton } from "@/features/start-mapping/components/model-details-button";
import { ModelPredictionsTracker } from "@/features/start-mapping/components/model-predictions-tracker";
import { ModelSettings } from "@/features/start-mapping/components/model-settings";
import { TDownloadOptions, TQueryParams } from "@/app/routes/start-mapping";
import { TModelDetails } from "@/types";
import { ToolTip } from "@/components/ui/tooltip";
import { useState } from "react";
import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { ImagerySourceSelectorTriggerButton } from "./replicable-models/imagery-source-selector-trigger-button";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { useMapStore } from "@/store/map-store";

export const StartMappingMobileDrawer = ({
  isOpen,

  map,

  downloadOptions,
  query,
  updateQuery,

  modelInfo,
  predictionImageryURL,
  modelInfoRequestIsPending,
  modelInfoRequestIsError,
  setPredictionImageryURL,
  predictionImagerySource,
  setPredictionImagerySource,
  modelDefaultImageryURL,
  customTileServerURL,
  setCustomTileServerURL,
  openMobileDialog,
}: {
  isOpen: boolean;

  map: Map | null;
  downloadOptions: TDownloadOptions;
  query: TQueryParams;
  updateQuery: (newParams: TQueryParams) => void;

  modelInfo: TModelDetails;
  predictionImageryURL: string | undefined;
  modelInfoRequestIsPending: boolean;
  modelInfoRequestIsError: boolean;
  setPredictionImageryURL: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  predictionImagerySource: PredictionImagerySource;
  setPredictionImagerySource: React.Dispatch<
    React.SetStateAction<PredictionImagerySource>
  >;
  modelDefaultImageryURL: string;
  customTileServerURL: string;
  setCustomTileServerURL: React.Dispatch<React.SetStateAction<string>>;
  openMobileDialog: () => void;
}) => {
  const [showDownloadOptions, setShowDownloadOptions] =
    useState<boolean>(false);
  const currentZoom = useMapStore((state) => state.zoom);

  const disablePrediction =
    currentZoom < MIN_ZOOM_LEVEL_FOR_START_MAPPING_PREDICTION;

  return (
    <MobileDrawer open={isOpen} dialogTitle="Start Mapping Mobile Dialog">
      {disablePrediction && (
        <p className="text-center italic text-body-4 text-primary w-full">
          {MINIMUM_ZOOM_LEVEL_INSTRUCTION_FOR_PREDICTION}
        </p>
      )}
      <div className="app-padding flex flex-col gap-y-6 ">
        <div className="flex items-center justify-between my-4 gap-x-2">
          <div className="w-full basis-5/6">
            <ModelAction
              query={query}
              map={map}
              modelInfo={modelInfo}
              predictionImageryURL={predictionImageryURL}
            />
          </div>
          <div
            className="p-1 flex items-center justify-center icon-interaction rounded-xl"
            id="anchor1"
          >
            <ModelDetailsTriggerButton
              modelInfo={modelInfo}
              modelInfoRequestIsPending={modelInfoRequestIsPending}
              modelInfoRequestIsError={modelInfoRequestIsError}
            />
          </div>
        </div>
        <div className="flex items-center gap-x-2 w-full justify-between">
          <p className="text-body-3 text-nowrap">Prediction imagery</p>
          <ImagerySourceSelectorTriggerButton
            setPredictionImageryURL={setPredictionImageryURL}
            predictionImagerySource={predictionImagerySource}
            setPredictionImagerySource={setPredictionImagerySource}
            modelDefaultImageryURL={modelDefaultImageryURL}
            customTileServerURL={customTileServerURL}
            setCustomTileServerURL={setCustomTileServerURL}
            openMobileDialog={openMobileDialog}
            isMobile
          />
        </div>
        <div className="text-body-3 font-normal flex items-center gap-x-2">
          {START_MAPPING_PAGE_CONTENT.mapData.title} -{" "}
          <ModelPredictionsTracker />
        </div>
        <div className="flex flex-col gap-y-4">
          <p className="text-body-3 font-semibold">Settings</p>
          <div className="border rounded-lg border-gray-border p-2">
            <ModelSettings query={query} updateQuery={updateQuery} isMobile />
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <ToolTip
            content={
              disablePrediction
                ? START_MAPPING_PAGE_CONTENT.actions.disabledModeTooltip(
                    "see download options",
                  )
                : null
            }
          >
            <button
              className="flex w-fit items-center gap-x-4"
              disabled={disablePrediction}
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            >
              <p className="text-body-3 font-semibold">Download</p>
              <span>
                <ChevronDownIcon
                  className={`icon  transition-all ${showDownloadOptions ? "rotate-180" : "rotate-0"}`}
                />
              </span>
            </button>
          </ToolTip>
          {showDownloadOptions ? (
            <ul className="flex flex-col gap-y-6 text-body-3">
              {downloadOptions
                .filter((option) => option.showOnMobile)
                .map((option) => (
                  <li key={option.value}>
                    <button
                      className="flex items-center gap-x-4"
                      onClick={option.onClick}
                    >
                      {option.name} <CloudDownloadIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
      </div>
    </MobileDrawer>
  );
};
