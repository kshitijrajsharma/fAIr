import { API_ENDPOINTS, apiClient } from "@/services";
import { TTrainingDataset } from "@/types";

export const getTrainingDataset = async (
  id: number,
): Promise<TTrainingDataset> => {
  const res = await apiClient.get(API_ENDPOINTS.GET_TRAINING_DATASET(id));
  return res.data;
};

export const getTrainingDatasets = async (
  searchQuery: string,
  ordering: string = "-id",
): Promise<TTrainingDataset[]> => {
  const res = await apiClient.get(
    API_ENDPOINTS.GET_TRAINING_DATASETS(searchQuery, ordering),
  );
  return res.data?.results;
};

export const getTrainingDatasetsV2 = async (
  searchQuery?: string,
  // todo - add date ordering
  ordering: string = "-id",
  // page: number,
  userId?: number,
): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: TTrainingDataset[];
  hasNext: boolean;
  hasPrev: boolean;
}> => {
  const res = await apiClient.get(
    API_ENDPOINTS.GET_TRAINING_DATASETS_V2(searchQuery, ordering, userId),
  );
  return {
    ...res.data,
    hasNext: res.data.next !== null,
    hasPrev: res.data.previous !== null,
  };
};
