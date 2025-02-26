import { getTMSTileJSONQueryOptions } from "@/features/model-creation/api/factory";
import { useQuery } from "@tanstack/react-query";

export const useGetTMSTileJSON = (url: string, enabled: boolean) => {
  return useQuery({
    ...getTMSTileJSONQueryOptions(url),
    enabled: enabled,
  });
};
