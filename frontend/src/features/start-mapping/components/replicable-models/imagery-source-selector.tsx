import { ELEMENT_DISTANCE_FROM_NAVBAR } from "@/config";
import { Popup } from "@/components/ui/popup";
import { PredictionImagerySource } from "@/enums/start-mapping";
import { useState } from "react";
import { INPUT_TYPES, SHOELACE_SIZES } from "@/enums";
import { HelpText, Input } from "@/components/ui/form";
import { TMS_URL_REGEX_PATTERN } from "@/utils";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/form/radio-group/radio-group";


// Rename as background imagery
// Check OpenStreetMap.
// Other defaults. 
// Esri Link - https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/mapserver/tile/4756/{z}/{x}/{y}
// Kontour https://apps.kontur.io/raster-tiler/oam/mosaic/{z}/{x}/{y}.png
// Get links from OSM.
// For custom, tell users to zoom to the area.
// https://apps.kontur.io/raster-tiler/oam/mosaic/{z}/{x}/{y}.png

export const ImagerySourceSelector = ({
    showPopup,
    anchor,
    handleImagerySourceSelectorTriggerButtonClick,
    predictionImagery,
    setPredictionImagery,
    closeMobileDrawer,
    setPredictionImagerySource,
    predictionImagerySource,
}: {
    showPopup: boolean;
    anchor: string;
    handleImagerySourceSelectorTriggerButtonClick: () => void;
    predictionImagery: string | undefined;
    setPredictionImagery: React.Dispatch<
        React.SetStateAction<string | undefined>
    >;
    closeMobileDrawer: () => void;
    setPredictionImagerySource: React.Dispatch<
        React.SetStateAction<PredictionImagerySource>
    >;
    predictionImagerySource: PredictionImagerySource;
}) => {
    return (
        <Popup
            active={showPopup}
            anchor={anchor}
            placement="bottom-start"
            distance={ELEMENT_DISTANCE_FROM_NAVBAR}
        >
            <div className="border bg-white border-gray-border shadow-lg rounded-xl w-[350px] p-4 max-h-[400px] overflow-y-auto flex flex-col">
                <RadioGroup
                    options={Object.values(PredictionImagerySource).map((value) => ({
                        value,
                        label: value,
                    }))}
                    onChange={(e) => {
                        setPredictionImagerySource(e as PredictionImagerySource);
                    }}
                    value={predictionImagerySource}
                />
                {predictionImagerySource ===
                    PredictionImagerySource.CustomImagery && (
                        <CustomImageryInput setPredictionImagery={setPredictionImagery} />
                    )}
            </div>
        </Popup>
    );
};

const CustomImageryInput = ({
    setPredictionImagery,
}: {
    setPredictionImagery: React.Dispatch<
        React.SetStateAction<string | undefined>
    >;
}) => {
    const [tileServerURL, setTileServerURL] = useState<string>("");
    const [isValid, setIsValid] = useState({
        valid: false,
        message: "",
    });
    return (
        <div className="flex flex-col gap-y-2 mt-2">
            <Input
                label="Custom Imagery URL"
                labelWithTooltip
                value={tileServerURL}
                toolTipContent={"Enter the TMS URL of your custom imagery"}
                placeholder={"Enter the TMS URL of your custom imagery"}
                showBorder
                pattern={TMS_URL_REGEX_PATTERN}
                handleInput={(e) => setTileServerURL(e.target.value)}
                type={INPUT_TYPES.URL}
                validationStateUpdateCallback={(validationState) =>
                    setIsValid(validationState)
                }
                isValid={tileServerURL.length > 0 && isValid.valid}
                size={SHOELACE_SIZES.SMALL}
            />
            <HelpText>
                {isValid.message.length > 0 ? (
                    isValid.message
                ) : (
                    <span className="text-wrap text-xs">
                        The TMS imagery link should follow this format:
                        https://tiles.openaerialmap.org/****/*/***/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.
                        Ensure your imagery URL adheres to the{" "}
                        <a
                            href="https://github.com/hotosm/fair?tab=readme-ov-file#imagery-license"
                            target="_blank"
                            className="text-primary underline"
                        >
                            license requirements
                        </a>
                        .
                    </span>
                )}
            </HelpText>
            <Button
                className="!w-fit"
                size={SHOELACE_SIZES.SMALL}
                uppercase={false}
                disabled={tileServerURL.length === 0 || !isValid.valid}
            >
                Apply
            </Button>
        </div>
    );
};
