import { create } from "zustand";
import { TModelPredictionFeature, TModelPredictions } from "@/types";

type ModelPredictionState = {
  modelPredictions: TModelPredictions;
  setModelPredictions: (newPredictions: TModelPredictions) => void;
  resetModelPredictions: () => void;
  moveFeatureBetweenBuckets: (
    from: keyof TModelPredictions,
    to: keyof TModelPredictions,
    id: number,
    updatedProperties?: Partial<TModelPredictionFeature["properties"]>,
  ) => void;
};

const emptyPredictionState: TModelPredictions = {
  accepted: [],
  rejected: [],
  all: [],
};

export const useModelPredictionStore = create<ModelPredictionState>(
  (set, get) => ({
    modelPredictions: emptyPredictionState,

    setModelPredictions: (newPredictions) => {
      set({ modelPredictions: newPredictions });
    },

    resetModelPredictions: () => {
      set({ modelPredictions: emptyPredictionState });
    },

    moveFeatureBetweenBuckets: (from, to, id, updatedProps = {}) => {
      const state = get().modelPredictions;

      const source = state[from].filter((f) => f.properties.id !== id);
      const moved = state[from]
        .filter((f) => f.properties.id === id)
        .map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            ...updatedProps,
          },
        }));
      const target = [...state[to], ...moved];

      set({
        modelPredictions: {
          ...state,
          [from]: source,
          [to]: target,
        },
      });
    },
  }),
);
