import { API_ENDPOINTS, apiClient } from "@/services";
import { TUser } from "@/types";

export const getUserProfile = async (osmId: number): Promise<TUser[]> => {
  const res = await apiClient.get(API_ENDPOINTS.GET_USER_PROFILE(osmId));
  return res.data.results;
};
