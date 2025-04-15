import { addLayers, addSources } from "@/utils/geo/map-utils";
import { LayerSpecification, Map, SourceSpecification } from "maplibre-gl";
import { useCallback, useEffect } from "react";

export const useMapLayers = (
  layersSpec: LayerSpecification[],
  sourcesSpec: { id: string; spec: SourceSpecification }[],
  map: Map | null,
) => {
  const addSourcesAndLayers = useCallback(() => {
    if (!map || !map.isStyleLoaded()) return;
    addSources(map, sourcesSpec);
    addLayers(map, layersSpec);
  }, [map, sourcesSpec, layersSpec]);

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
    if (!map.isStyleLoaded()) {
      map.once("styledata", addSourcesAndLayers);
    } else {
      addSourcesAndLayers();
    }
    return () => {
      map.off("styledata", addSourcesAndLayers);
    };
  }, [map, addSourcesAndLayers, layersSpec, sourcesSpec]);

  return null;
};

/**
 * Custom hook to manage dynamic map layers.
 * @param map
 * @param sourceId
 * @param layerId
 * @param sourceSpec
 * @param layerSpec
 * @param dependencies
 * @returns
 */
export const useDynamicMapLayer = (
  map: Map | null,
  sourceId: string,
  layerId: string,
  sourceSpec: SourceSpecification | null,
  layerSpec: LayerSpecification | null,
  dependencies: any[] = [],
  enabled: boolean = true,
) => {
  useEffect(() => {
    if (!map || !sourceSpec || !layerSpec || !enabled) return;

    const addOrUpdateLayer = async () => {
      const existingSource = map.getSource(sourceId);
      if (existingSource) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        map.removeSource(sourceId);
      } else {
        map.addSource(sourceId, sourceSpec);
        map.addLayer(layerSpec);
      }

      if (sourceSpec.type === "raster" && "bounds" in sourceSpec) {
        map.fitBounds(sourceSpec.bounds as [number, number, number, number]);
      }
    };

    addOrUpdateLayer();

    return () => {
      if (map && map.getStyle()) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      }
    };
  }, [map, sourceId, layerId, sourceSpec, layerSpec, ...dependencies]);
};
