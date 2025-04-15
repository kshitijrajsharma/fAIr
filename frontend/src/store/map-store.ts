// store/zoomStore.ts
import { create } from "zustand";

type MapState = {
  zoom: number;
  setZoom: (zoom: number) => void;
};

export const useMapStore = create<MapState>((set) => ({
  zoom: 0,
  setZoom: (zoom) => set({ zoom }),
}));
