import { DropDown } from "@/components/ui/dropdown";
import { ChevronDownIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";
import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import { DropdownPlacement } from "@/enums";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { ImagerySourceSelector } from "./imagery-source-selector";
import { PredictionImagerySource } from "@/enums/start-mapping";

export const ImagerySourceSelectorTriggerButton = ({
  setPredictionImageryURL,
  predictionImagerySource,
  setPredictionImagerySource,
  modelDefaultImageryURL,
  customTileServerURL,
  setCustomTileServerURL,
  isMobile = false,
  openMobileDialog,
}: {
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
  isMobile?: boolean;
  openMobileDialog?: () => void;
}) => {
  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();

  return (
    <div className="flex items-center gap-x-1">
      <DropDown
        placement={DropdownPlacement.TOP_END}
        disableCheveronIcon
        disabled={isMobile}
        dropdownIsOpened={dropdownIsOpened}
        onDropdownHide={onDropdownHide}
        onDropdownShow={onDropdownShow}
        distance={ELEMENT_DISTANCE_FROM_NAVBAR}
        triggerComponent={
          <ToolTip content={!isMobile ? "Prediction Imagery" : ""}>
            <div
              className={` px-2 bg-off-white hover:bg-opacity-50 flex items-center p-2 gap-x-2 rounded-[6px]`}
            >
              <button
                onClick={
                  isMobile
                    ? openMobileDialog
                    : dropdownIsOpened
                      ? onDropdownHide
                      : onDropdownShow
                }
                className={` ${isMobile ? "w-full max-w-[200px] text-body-3" : "max-w-[50px] md:max-w-[100px] text-body-4 "} overflow-hidden text-ellipsis whitespace-nowrap`}
              >
                {predictionImagerySource}
              </button>
              <ChevronDownIcon
                className={`transition-all ${isMobile ? "-rotate-90" : dropdownIsOpened ? "rotate-180" : ""} w-3 h-3`}
              />
            </div>
          </ToolTip>
        }
      >
        <ImagerySourceSelector
          setPredictionImageryURL={setPredictionImageryURL}
          predictionImagerySource={predictionImagerySource}
          setPredictionImagerySource={setPredictionImagerySource}
          modelDefaultImageryURL={modelDefaultImageryURL}
          customTileServerURL={customTileServerURL}
          setCustomTileServerURL={setCustomTileServerURL}
        />
      </DropDown>
    </div>
  );
};
