import { HelpText, Input } from "@/components/ui/form";
import { INPUT_TYPES, SHOELACE_SIZES } from "@/enums";
import { XYZ_TILESERVER_URL_REGEX_PATTERN } from "@/utils";

export const XYZTileServerInput = ({
  tileServerURL,
  setTileServerURL,
  isValid,
  validationStateUpdateCallback,
  labelWithTooltip = true,
  showBorder = true,
  size,
  pattern = XYZ_TILESERVER_URL_REGEX_PATTERN.source,
}: {
  tileServerURL: string;
  setTileServerURL: (url: string) => void;
  isValid: { valid: boolean; message: string };
  labelWithTooltip?: boolean;
  showBorder?: boolean;
  size?: SHOELACE_SIZES;
  validationStateUpdateCallback?: (validationState: {
    valid: boolean;
    message: string;
  }) => void;
  pattern?: string;
}) => {
  return (
    <>
      <Input
        label={"XYZ/TMS Tile Server URL"}
        labelWithTooltip={labelWithTooltip}
        value={tileServerURL}
        toolTipContent={
          "Provide the URL template for your XYZ tile server. For example, use the TMS link from OpenAerialMap (OAM) or a custom URL."
        }
        placeholder={"e.g. https://tiles.example.com/{z}/{x}/{y}"}
        showBorder={showBorder}
        pattern={pattern}
        handleInput={(e) => setTileServerURL(e.target.value)}
        type={INPUT_TYPES.URL}
        validationStateUpdateCallback={validationStateUpdateCallback}
        isValid={tileServerURL.length > 0 && isValid.valid}
        size={size}
      />
      <HelpText>
        {isValid.message.length > 0 ? (
          isValid.message
        ) : (
          <span className="text-wrap text-xs">
            The XYZ/TMS imagery link should follow the TMS/XYZ standard format:{" "}
            {`https://tiles.example.com/{z}/{x/y}/{y/x}`} Ensure your imagery
            URL has CORS enabled and adheres to the{" "}
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
    </>
  );
};
