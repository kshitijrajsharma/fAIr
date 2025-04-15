import useScreenSize from "@/hooks/use-screen-size";
import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { TagsInfoIcon } from "@/components/ui/icons";
import { ToolTip } from "@/components/ui/tooltip";
import { DropDown } from "@/components/ui/dropdown";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";
import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import { DropdownPlacement } from "@/enums";
import { ModelDetailsInfo } from "./model-details-info";
import { TModelDetails } from "@/types";
import { useState } from "react";

export const ModelDetailsTriggerButton = ({
  modelInfo,
  modelInfoRequestIsPending,
  modelInfoRequestIsError,
}: {
  modelInfo?: TModelDetails;
  modelInfoRequestIsPending?: boolean;
  modelInfoRequestIsError?: boolean;
}) => {
  const { isSmallViewport } = useScreenSize();
  const { dropdownIsOpened, onDropdownHide, onDropdownShow } =
    useDropdownMenu();
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);
  const handleClick = () => {
    if (isSmallViewport) {
      setShowMobileDrawer(!showMobileDrawer);
    }
  };
  return (
    <DropDown
      placement={DropdownPlacement.TOP_END}
      disableCheveronIcon
      dropdownIsOpened={dropdownIsOpened}
      onDropdownHide={onDropdownHide}
      onDropdownShow={onDropdownShow}
      distance={ELEMENT_DISTANCE_FROM_NAVBAR}
      triggerComponent={
        <ToolTip
          content={
            !isSmallViewport
              ? START_MAPPING_PAGE_CONTENT.modelDetails.tooltip
              : null
          }
        >
          <button
            className={`p-1 flex items-center justify-center hover:icon-interaction ${dropdownIsOpened && "icon-interaction"}`}
            onClick={handleClick}
          >
            <TagsInfoIcon className="icon-lg md:size-5 text-grey" />
          </button>
        </ToolTip>
      }
    >
      <ModelDetailsInfo
        modelInfo={modelInfo}
        modelInfoRequestIsPending={modelInfoRequestIsPending}
        modelInfoRequestIsError={modelInfoRequestIsError}
        showMobileDrawer={showMobileDrawer}
        setShowMobileDrawer={setShowMobileDrawer}
      />
    </DropDown>
  );
};
