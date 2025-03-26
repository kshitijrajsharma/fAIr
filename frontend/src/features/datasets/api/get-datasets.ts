import { PAGE_LIMIT } from "@/components/shared";
import { API_ENDPOINTS, apiClient } from "@/services";
import { TTrainingDataset } from "@/types";

export const getTrainingDataset = async (
  id: number,
): Promise<TTrainingDataset> => {
  const res = await apiClient.get(API_ENDPOINTS.GET_TRAINING_DATASET(id));
  return res.data;
};

export const getTrainingDatasetsV2 = async (
  searchQuery?: string,
  // todo - add date ordering
  ordering: string = "-id",
  // page: number,
  userId?: number,
  offset?: number,
): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: TTrainingDataset[];
  hasNext: boolean;
  hasPrev: boolean;
}> => {
  const res = await apiClient.get(API_ENDPOINTS.GET_TRAINING_DATASETS_V2, {
    params: {
      search: searchQuery,
      ordering,
      user: userId,
      offset,
      limit: PAGE_LIMIT,
    },
  });
  return {
    ...res.data,
    hasNext: res.data.next !== null,
    hasPrev: res.data.previous !== null,
  };
};
