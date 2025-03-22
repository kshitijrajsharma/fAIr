import { useQuery } from "@tanstack/react-query";
import {
  getTrainingDatasetQueryOptions,
  getTrainingDatasetsQueryOptions,
  getTrainingDatasetsQueryOptionsV2,
} from "@/features/datasets/api/factory";

export const useGetTrainingDataset = (id: number, enabled: boolean = !!id) => {
  return useQuery({
    ...getTrainingDatasetQueryOptions(id),
    enabled: enabled,
  });
};

export const useGetTrainingDatasets = (searchQuery: string) => {
  return useQuery({
    ...getTrainingDatasetsQueryOptions(searchQuery),
  });
};

export const useGetTrainingDatasetsV2 = (
  searchQuery?: string,
  ordering?: string,
  userId?: number,
) => {
  return useQuery({
    ...getTrainingDatasetsQueryOptionsV2(searchQuery, ordering, userId),
  });
};
