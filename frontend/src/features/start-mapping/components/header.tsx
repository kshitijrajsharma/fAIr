import ModelAction from "@/features/start-mapping/components/model-action";
import { BrandLogoWithDropDown } from "./logo-with-dropdown";
import { ButtonWithIcon } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/ui/icons";
import { DropDown } from "@/components/ui/dropdown";
import { ButtonVariant, DropdownPlacement, SHOELACE_SIZES } from "@/enums";
import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import { Map } from "maplibre-gl";
import { ModelDetailsTriggerButton } from "@/features/start-mapping/components/model-details-button";
import { ModelPredictionsTracker } from "@/features/start-mapping/components/model-predictions-tracker";
import { ModelSettings } from "@/features/start-mapping/components/model-settings";
import { SkeletonWrapper } from "@/components/ui/skeleton";
import { TDownloadOptions, TQueryParams } from "@/app/routes/start-mapping";
import { TModelDetails } from "@/types";
import { ToolTip } from "@/components/ui/tooltip";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { UserProfile } from "@/components/layouts";
import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { ImagerySourceSelectorTriggerButton } from "./replicable-models/imagery-source-selector-trigger-button";
import { PredictionImagerySource } from "@/enums/start-mapping";

const StartMappingHeader = ({
  modelInfo,
  modelPredictionsExist,
  modelInfoRequestIsPending,
  modelInfoRequestIsError,
  query,
  updateQuery,
  map,
  downloadOptions,
  predictionImageryURL,
  setPredictionImageryURL,
  predictionImagerySource,
  setPredictionImagerySource,
  modelDefaultImageryURL,
  customTileServerURL,
  setCustomTileServerURL,
}: {
  modelPredictionsExist: boolean;
  modelInfoRequestIsPending: boolean;
  modelInfoRequestIsError: boolean;
  modelInfo: TModelDetails;

  query: TQueryParams;
  updateQuery: (newParams: TQueryParams) => void;

  map: Map | null;
  downloadOptions: TDownloadOptions;

  predictionImageryURL: string | undefined;
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
}) => {
  const { onDropdownHide, onDropdownShow, dropdownIsOpened } =
    useDropdownMenu();

  const {
    onDropdownHide: onFAIRLogoDropdownHide,
    onDropdownShow: onFAIRLogoDropdownShow,
    dropdownIsOpened: FAIRLogoDropdownIsOpened,
  } = useDropdownMenu();

  return (
    <SkeletonWrapper
      showSkeleton={modelInfoRequestIsPending || modelInfoRequestIsError}
      skeletonClassName="h-10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-0.5">
          <BrandLogoWithDropDown
            onClose={onFAIRLogoDropdownHide}
            onShow={onFAIRLogoDropdownShow}
            isOpened={FAIRLogoDropdownIsOpened}
          />
          <div className="flex flex-col md:flex-row md:items-center gap-x-2 z-10">
            <p
              title={modelInfo?.name}
              className="text-dark text-body-4 font-medium text-nowrap truncate md:max-w-[20px] lg:max-w-[300px] xl:max-w-[400px]"
            >
              {modelInfo?.name ?? "N/A"}
            </p>
            <ModelDetailsTriggerButton
              modelInfo={modelInfo}
              modelInfoRequestIsError={modelInfoRequestIsError}
              modelInfoRequestIsPending={modelInfoRequestIsPending}
            />
          </div>
        </div>
        <div>
          <ImagerySourceSelectorTriggerButton
            setPredictionImageryURL={setPredictionImageryURL}
            predictionImagerySource={predictionImagerySource}
            setPredictionImagerySource={setPredictionImagerySource}
            modelDefaultImageryURL={modelDefaultImageryURL}
            customTileServerURL={customTileServerURL}
            setCustomTileServerURL={setCustomTileServerURL}
          />
        </div>
        <div className="flex flex-row items-center gap-x-2">
          <ModelSettings updateQuery={updateQuery} query={query} />
          <div className="flex flex-row items-center gap-y-3 gap-x-2">
            <ModelPredictionsTracker />
            <DropDown
              placement={DropdownPlacement.TOP_END}
              disableCheveronIcon
              dropdownIsOpened={dropdownIsOpened}
              onDropdownHide={onDropdownHide}
              onDropdownShow={onDropdownShow}
              menuItems={downloadOptions}
              distance={ELEMENT_DISTANCE_FROM_NAVBAR}
              triggerComponent={
                <ToolTip
                  content={
                    !modelPredictionsExist
                      ? START_MAPPING_PAGE_CONTENT.actions.disabledModeTooltip(
                          "see actions",
                        )
                      : null
                  }
                >
                  <ButtonWithIcon
                    uppercase={false}
                    onClick={dropdownIsOpened ? onDropdownHide : onDropdownShow}
                    suffixIcon={ChevronDownIcon}
                    label={START_MAPPING_PAGE_CONTENT.buttons.download.label}
                    size={SHOELACE_SIZES.SMALL}
                    textClassName="text-body-4"
                    variant={ButtonVariant.SECONDARY}
                    disabled={!modelPredictionsExist}
                    iconClassName={`transition-all ${dropdownIsOpened && "rotate-180"} w-3 h-3`}
                  />
                </ToolTip>
              }
            />
          </div>
          <ModelAction
            map={map}
            query={query}
            modelInfo={modelInfo}
            predictionImageryURL={predictionImageryURL}
          />
          <UserProfile hideFullName smallerSize />
        </div>
      </div>
    </SkeletonWrapper>
  );
};

export default StartMappingHeader;
