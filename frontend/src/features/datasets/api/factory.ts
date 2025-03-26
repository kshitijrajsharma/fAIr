import { queryOptions } from "@tanstack/react-query";
import {
  getTrainingDataset,
  getTrainingDatasets,
  getTrainingDatasetsV2,
} from "./get-datasets";

export const getTrainingDatasetQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: ["training-dataset", id],
    queryFn: () => getTrainingDataset(id),
  });
};

export const getTrainingDatasetsQueryOptions = (searchQuery: string) => {
  return queryOptions({
    queryKey: ["training-datasets", searchQuery],
    queryFn: () => getTrainingDatasets(searchQuery),
  });
};

export const getTrainingDatasetsQueryOptionsV2 = (
  searchQuery?: string,
  ordering?: string,
  userId?: number,
) => {
  return queryOptions({
    queryKey: ["training-datasets-v2", searchQuery, ordering, userId],
    queryFn: () => getTrainingDatasetsV2(searchQuery, ordering, userId),
  });
};
