import { useQuery } from "@tanstack/react-query";
import {
  getTrainingDatasetQueryOptions,
  getTrainingDatasetsQueryOptionsV2,
} from "@/features/datasets/api/factory";

export const useGetTrainingDataset = (id: number, enabled: boolean = !!id) => {
  return useQuery({
    ...getTrainingDatasetQueryOptions(id),
    enabled: enabled,
  });
};

export const useGetTrainingDatasetsV2 = (
  searchQuery?: string,
  ordering?: string,
  userId?: number,
  offset?: number,
) => {
  return useQuery({
    ...getTrainingDatasetsQueryOptionsV2(searchQuery, ordering, userId, offset),
  });
};
