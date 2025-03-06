import { queryOptions } from "@tanstack/react-query";
import { getUserProfile } from "./get-profile";

export const getUserProfileQueryOptions = (osmId: number) => {
  return queryOptions({
    queryKey: ["user-profile", osmId],
    queryFn: () => getUserProfile(osmId),
  });
};
