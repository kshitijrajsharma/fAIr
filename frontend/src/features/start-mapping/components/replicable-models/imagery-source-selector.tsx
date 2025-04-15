import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import { Popup } from "@/components/ui/popup";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { useMemo, useState } from "react";
import { SHOELACE_SIZES } from "@/enums";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/form/radio-group/radio-group";
import { XYZTileServerInput } from "@/components/shared/form/xyz-tile-server-input";
import { showSuccessToast } from "@/utils";

const PredictionImagerySources: Array<{
  value: PredictionImagerySource;
  label: string;
  url?: string;
  tooltip: string;
}> = [
  {
    value: PredictionImagerySource.ModelDefault,
    label: "Model Default",
    url: "",
    tooltip: "Default imagery for the model.",
  },
  {
    value: PredictionImagerySource.CustomImagery,
    label: "Custom Imagery",
    tooltip: "Use a custom XYZ/TMS tile server URL.",
  },
  {
    value: PredictionImagerySource.EsriWorldImagery,
    label: "Esri World Imagery",
    url: "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}?blankTile=false",
    tooltip: "Esri World Imagery tiles.",
  },
  {
    value: PredictionImagerySource.Kontour,
    label: "OpenAerialMap Mosaic, by Kontur.io",
    url: "https://apps.kontur.io/raster-tiler/oam/mosaic/{z}/{x}/{y}",
    tooltip: "All OpenAerialMap images in one mosaic layer, by Kontur.io.",
  },
];

export const ImagerySourceSelector = ({
  showPopup,
  anchor,
  setPredictionImageryURL,
  setPredictionImagerySource,
  predictionImagerySource,
  modelDefaultImageryURL,
  customTileServerURL,
  setCustomTileServerURL,
}: {
  showPopup: boolean;
  anchor: string;
  setPredictionImageryURL: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  setPredictionImagerySource: React.Dispatch<
    React.SetStateAction<PredictionImagerySource>
  >;
  predictionImagerySource: PredictionImagerySource;
  modelDefaultImageryURL: string | undefined;
  customTileServerURL: string;
  setCustomTileServerURL: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const PredictionImagerySourceURLS = useMemo(
    () => ({
      [PredictionImagerySource.CustomImagery]: customTileServerURL,
      [PredictionImagerySource.ModelDefault]: modelDefaultImageryURL,
      [PredictionImagerySource.Kontour]:
        "https://apps.kontur.io/raster-tiler/oam/mosaic/{z}/{x}/{y}.png",
      [PredictionImagerySource.EsriWorldImagery]:
        "https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/mapserver/tile/{z}/{y}/{x}",
    }),
    [customTileServerURL, modelDefaultImageryURL],
  );

  return (
    <Popup
      active={showPopup}
      anchor={anchor}
      placement="bottom-start"
      distance={ELEMENT_DISTANCE_FROM_NAVBAR}
    >
      <div className="border bg-white border-gray-border shadow-lg rounded-xl w-[350px] p-4 max-h-[400px] gap-y-4 overflow-y-auto flex flex-col scrollable">
        <RadioGroup
          options={PredictionImagerySources}
          onChange={(e) => {
            setPredictionImagerySource(e as PredictionImagerySource);
            setPredictionImageryURL(
              (
                PredictionImagerySourceURLS as Record<
                  PredictionImagerySource,
                  string | undefined
                >
              )[e as PredictionImagerySource],
            );
          }}
          value={predictionImagerySource}
          withTooltip
        />
        {predictionImagerySource === PredictionImagerySource.CustomImagery && (
          <CustomImageryInput
            setPredictionImageryURL={setPredictionImageryURL}
            customTileServerURL={customTileServerURL}
            setCustomTileServerURL={setCustomTileServerURL}
          />
        )}
        {predictionImagerySource !== PredictionImagerySource.ModelDefault && (
          <small>
            ⚠️ You are trying to run the model on an image different from the
            one it was trained with, the result might not be accurate.
          </small>
        )}
      </div>
    </Popup>
  );
};

const CustomImageryInput = ({
  setPredictionImageryURL,
  customTileServerURL,
  setCustomTileServerURL,
}: {
  setPredictionImageryURL: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  customTileServerURL: string;
  setCustomTileServerURL: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [isValid, setIsValid] = useState({
    valid: false,
    message: "",
  });

  return (
    <div className="flex flex-col gap-y-2 mt-2">
      <XYZTileServerInput
        isValid={isValid}
        setTileServerURL={setCustomTileServerURL}
        tileServerURL={customTileServerURL}
        validationStateUpdateCallback={(validationState) =>
          setIsValid(validationState)
        }
        size={SHOELACE_SIZES.SMALL}
      />
      <Button
        className="!w-fit"
        size={SHOELACE_SIZES.SMALL}
        uppercase={false}
        disabled={customTileServerURL.length === 0 || !isValid.valid}
        onClick={() => {
          setPredictionImageryURL(customTileServerURL);
          showSuccessToast(
            "Custom imagery URL applied successfully. Please zoom to the area to view the imagery.",
          );
        }}
      >
        Apply
      </Button>
    </div>
  );
};
