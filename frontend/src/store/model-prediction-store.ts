import { create } from "zustand";
import { TModelPredictions } from "@/types";


// WIP 
type ModelPredictionState = {
    modelPredictions: TModelPredictions;
    setModelPredictions: (newPredictions: TModelPredictions) => void;
}

const emptyPredictionState = {
    accepted: [],
    rejected: [],
    all: [],
};

export const useModelPredictionStore = create<ModelPredictionState>((set) => ({
    modelPredictions: emptyPredictionState,
    setModelPredictions: (newPredictions: TModelPredictions) => set((state) => ({
        ...state,
        modelPredictions: newPredictions,
    })),
}));
