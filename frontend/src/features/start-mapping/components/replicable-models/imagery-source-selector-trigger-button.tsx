import { ImageryBackground } from "@/assets/images";
import { Image } from "@/components/ui/image";
import { ToolTip } from "@/components/ui/tooltip";

export const ImagerySourceSelectorTriggerButton = ({
  handleImagerySourceSelectorTriggerButtonClick,
  anchor,
  isImagerySelectorOpen,
}: {
  handleImagerySourceSelectorTriggerButtonClick: () => void;
  anchor: string;
  isImagerySelectorOpen: boolean;
}) => {
  return (
    <ToolTip content={"Prediction Imagery"}>
      <button
        className={`w-9 h-9 rounded-lg hover:icon-interaction flex items-center justify-center ${isImagerySelectorOpen && "icon-interaction"}`}
        onClick={handleImagerySourceSelectorTriggerButtonClick}
        id={anchor}
      >
        <Image
          src={ImageryBackground}
          alt=""
          className="rounded-md h-6 w-6 border border-black"
        />
      </button>
    </ToolTip>
  );
};
