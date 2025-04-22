import { PredictionImagerySource } from "@/enums/start-mapping";
import { useMemo, useState } from "react";
import { SHOELACE_SIZES } from "@/enums";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/form/radio-group/radio-group";
import { XYZTileServerInput } from "@/components/shared/form/xyz-tile-server-input";
import { showSuccessToast } from "@/utils";
import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { FormLabel } from "@/components/ui/form";

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
      value: PredictionImagerySource.Kontour,
      label: "OpenAerialMap Mosaic",
      url: "https://apps.kontur.io/raster-tiler/oam/mosaic/{z}/{x}/{y}",
      tooltip: "All OpenAerialMap images in one mosaic layer, by Kontur.io.",
    },
  ];

export const ImagerySourceSelector = ({
  setPredictionImageryURL,
  setPredictionImagerySource,
  predictionImagerySource,
  modelDefaultImageryURL,
  customTileServerURL,
  setCustomTileServerURL,
  isMobile,
}: {
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
  isMobile?: boolean;
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
    <div
      className={` bg-white ${isMobile ? "w-full" : "w-[350px]  shadow-lg rounded-xl border border-gray-border "} p-4 max-h-[400px] gap-y-4 overflow-y-auto flex flex-col scrollable`}
    >
      {!isMobile && (
        <FormLabel
          withTooltip
          label="Prediction Imagery"
          toolTipContent="Select the imagery source to be used for predictions."
        />
      )}
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
        <small>{START_MAPPING_PAGE_CONTENT.replicableModel.info}</small>
      )}
    </div>
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
        {START_MAPPING_PAGE_CONTENT.replicableModel.apply}
      </Button>
    </div>
  );
};
