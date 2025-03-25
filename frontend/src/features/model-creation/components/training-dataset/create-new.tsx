import { HelpText, Input } from "@/components/ui/form";
import { INPUT_TYPES } from "@/enums";
import { MODELS_CONTENT } from "@/constants";
import { useEffect, useState } from "react";
import {
  FORM_VALIDATION_CONFIG,
  MODEL_CREATION_FORM_NAME,
  useModelsContext,
} from "@/app/providers/models-provider";
import { MapIcon } from "@/components/ui/icons";
import { useMapInstance } from "@/hooks/use-map-instance";
import { extractTileJSONURL } from "@/utils";
import { getTMSTileJSON } from "@/features/model-creation/api/get-tms-tilejson";
import { MapComponent, OpenAerialMap } from "@/components/map";
import { Spinner } from "@/components/ui/spinner";

const PREVIEW_TMS_SOURCE_ID = "preview-tms-source";
const PREVIEW_TMS_LAYER_ID = "preview-tms-layer";

const CreateNewTrainingDatasetForm = () => {
  const { formData, handleChange } = useModelsContext();
  const { mapContainerRef, map } = useMapInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tileJSONURL = extractTileJSONURL(formData.tmsURL);

  useEffect(() => {
    if (!formData.tmsURLValidation.valid) return;
    if (!map) return;
    if (!tileJSONURL) return;

    const addOrUpdateLayer = async () => {
      setLoading(true);
      setError("");
      try {
        const source = map.getSource(PREVIEW_TMS_SOURCE_ID);
        if (source) {
          map.removeLayer(PREVIEW_TMS_LAYER_ID);
          map.removeSource(PREVIEW_TMS_SOURCE_ID);
        }

        map.addSource(PREVIEW_TMS_SOURCE_ID, {
          type: "raster",
          url: tileJSONURL,
          tileSize: 256,
        });

        map.addLayer({
          id: PREVIEW_TMS_LAYER_ID,
          type: "raster",
          source: PREVIEW_TMS_SOURCE_ID,
          layout: { visibility: "visible" },
        });

        const tileJSON = await getTMSTileJSON(tileJSONURL);
        map.fitBounds(tileJSON.bounds);
      } catch (e) {
        setError("Failed to load TMS imagery. Please check the URL.");
      } finally {
        setLoading(false);
      }
    };

    addOrUpdateLayer();

    return () => {
      if (map && map.getStyle()) {
        if (map.getLayer(PREVIEW_TMS_LAYER_ID)) {
          map.removeLayer(PREVIEW_TMS_LAYER_ID);
        }
        if (map.getSource(PREVIEW_TMS_SOURCE_ID)) {
          map.removeSource(PREVIEW_TMS_SOURCE_ID);
        }
      }
    };
  }, [tileJSONURL, formData.tmsURLValidation.valid, map]);

  useEffect(() => {
    if (formData.tmsURL.length > 0) return;

    if (formData.tmsURL.length === 0) {
      handleChange(MODEL_CREATION_FORM_NAME.TMS_URL_VALIDITY, {
        valid: false,
        message: "",
      });
    }
  }, [formData.tmsURL]);

  return (
    <div className="flex flex-col md:flex-row justify-between gap-12">
      <div className="flex flex-col gap-y-10 max-w-3xl w-full md:w-1/2">
        <Input
          handleInput={(e) =>
            handleChange(MODEL_CREATION_FORM_NAME.DATASET_NAME, e.target.value)
          }
          value={formData.datasetName}
          toolTipContent={
            MODELS_CONTENT.modelCreation.trainingDataset.form.datasetName
              .toolTip
          }
          label={
            MODELS_CONTENT.modelCreation.trainingDataset.form.datasetName.label
          }
          labelWithTooltip
          placeholder={
            MODELS_CONTENT.modelCreation.trainingDataset.form.datasetName
              .placeholder
          }
          showBorder
          helpText={
            MODELS_CONTENT.modelCreation.trainingDataset.form.datasetName
              .helpText
          }
          maxLength={
            FORM_VALIDATION_CONFIG[MODEL_CREATION_FORM_NAME.DATASET_NAME]
              .maxLength
          }
          minLength={
            FORM_VALIDATION_CONFIG[MODEL_CREATION_FORM_NAME.DATASET_NAME]
              .minLength
          }
        />
        <div>
          <Input
            value={formData.tmsURL}
            labelWithTooltip
            toolTipContent={
              MODELS_CONTENT.modelCreation.trainingDataset.form.tmsURL.toolTip
            }
            label={
              MODELS_CONTENT.modelCreation.trainingDataset.form.tmsURL.label
            }
            placeholder={
              MODELS_CONTENT.modelCreation.trainingDataset.form.tmsURL
                .placeholder
            }
            showBorder
            pattern={
              FORM_VALIDATION_CONFIG[MODEL_CREATION_FORM_NAME.TMS_URL].pattern
            }
            handleInput={(e) =>
              handleChange(MODEL_CREATION_FORM_NAME.TMS_URL, e.target.value)
            }
            type={INPUT_TYPES.URL}
            validationStateUpdateCallback={(validationState) =>
              handleChange(
                MODEL_CREATION_FORM_NAME.TMS_URL_VALIDITY,
                validationState,
              )
            }
            isValid={formData.tmsURLValidation.valid}
          />
          <HelpText>
            {formData.tmsURLValidation.message.length > 0 ? (
              formData.tmsURLValidation.message
            ) : (
              <span className="text-wrap">
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
        </div>
      </div>
      <div className="w-full md:w-1/2 border p-1 border-dashed relative h-80">
        <MapComponent map={map} mapContainerRef={mapContainerRef}>
          {formData.tmsURLValidation.valid && !loading && !error && (
            <OpenAerialMap tileJSONURL={tileJSONURL} map={map} />
          )}
        </MapComponent>
        {loading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <Spinner />
          </div>
        )}
        {!formData.tmsURLValidation.valid && !loading && (
          <div className="p-1 absolute z-[10] inset-0 bg-off-white flex flex-col gap-y-3 items-center justify-center w-full h-full text-body-4 md:text-base text-grey">
            <MapIcon className="icon-lg" />
            <p>Enter a TMS URL to see a preview.</p>
          </div>
        )}
        {error && formData.tmsURL.length > 0 && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10 text-primary">
            {error}
          </div>
        )}{" "}
      </div>
    </div>
  );
};

export default CreateNewTrainingDatasetForm;
