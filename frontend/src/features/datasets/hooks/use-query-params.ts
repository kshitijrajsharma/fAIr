import useDebounce from "@/hooks/use-debounce";
import { TQueryParams } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetTrainingDatasetsV2 } from "./use-datasets";
import { ORDERING_FIELDS } from "@/components/shared/filters/ordering-filter";

export const QUERY_PARAMS = {
  ordering: "orderBy",
  searchQuery: "q",
  offset: "offset",
};

export const useDatasetsQueryParams = (userId?: number) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultQueries = {
    [QUERY_PARAMS.offset]: 0,
    [QUERY_PARAMS.searchQuery]:
      searchParams.get(QUERY_PARAMS.searchQuery) || "",
    [QUERY_PARAMS.ordering]:
      searchParams.get(QUERY_PARAMS.ordering) ||
      (ORDERING_FIELDS[1].apiValue as string),
  };

  const [query, setQuery] = useState<TQueryParams>(defaultQueries);

  const debouncedSearchText = useDebounce(
    query[QUERY_PARAMS.searchQuery] as string,
    300,
  );

  const { isPending, isError, data, refetch, isPlaceholderData } =
    useGetTrainingDatasetsV2(
      debouncedSearchText.length > 0 ? debouncedSearchText : undefined,
      query[QUERY_PARAMS.ordering] as string,
      userId !== undefined ? userId : undefined,
      query[QUERY_PARAMS.offset] !== undefined
        ? (query[QUERY_PARAMS.offset] as number)
        : undefined,
    );

  const updateQuery = useCallback(
    (newParams: TQueryParams) => {
      setQuery((prevQuery) => ({
        ...prevQuery,
        ...newParams,
      }));
      const updatedParams = new URLSearchParams(searchParams);

      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          updatedParams.set(key, String(value));
        } else {
          updatedParams.delete(key);
        }
      });

      setSearchParams(updatedParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  //reset offset back to 0 when searching or when ID filtering is applied from the map.
  useEffect(() => {
    if (
      query[QUERY_PARAMS.searchQuery] !== "" &&
      (query[QUERY_PARAMS.offset] as number) > 0
    ) {
      updateQuery({ [QUERY_PARAMS.offset]: 0 });
    }
  }, [query]);

  useEffect(() => {
    const newQuery = {
      [QUERY_PARAMS.offset]: defaultQueries[QUERY_PARAMS.offset],
      [QUERY_PARAMS.ordering]: defaultQueries[QUERY_PARAMS.ordering],
      [QUERY_PARAMS.searchQuery]: defaultQueries[QUERY_PARAMS.searchQuery],
    };
    setQuery(newQuery);
  }, []);

  return {
    query,
    data,
    isPending,
    isPlaceholderData,
    isError,
    updateQuery,
    refetch,
  };
};
