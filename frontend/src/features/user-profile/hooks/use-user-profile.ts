import { useQuery } from "@tanstack/react-query";
import { getUserProfileQueryOptions } from "../api/factory";

export const useGetUserProfile = (osmId: number) => {
  return useQuery({
    ...getUserProfileQueryOptions(osmId),
  });
};
