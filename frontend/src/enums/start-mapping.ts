import { BASE_MODELS } from "./common";

export enum PredictionImagerySource {
  ModelDefault = "Model's Default",
  CustomImagery = "Custom Imagery",
  GoogleSatellite = "Google Satellite",
  Kontour = "OpenAerialMap Mosaic",
}

export const PredictionModel = {
  DEFAULT: "Default",
  CUSTOM: "Custom",
  ...BASE_MODELS,
};
