import styles from "./kpi.module.css";
import { API_ENDPOINTS, apiClient } from "@/services";
import { KPI_STATS_CACHE_TIME_MS } from "@/config";
import { SHARED_CONTENT } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

type TKPIS = {
  figure?: number;
  label: string;
}[];

type TKPIResponse = {
  total_accepted_predictions: number;
  total_feedback_labels: number;
  total_models_published: number;
  total_registered_users: number;
};

const fetchKPIStats = async (): Promise<TKPIResponse> => {
  const { data } = await apiClient.get(API_ENDPOINTS.GET_KPI_STATS);
  return data;
};

export const Kpi = () => {
  const [enabled, setEnabled] = useState<boolean>(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["kpis"],
    queryFn: fetchKPIStats,
    refetchInterval: KPI_STATS_CACHE_TIME_MS,
    enabled: enabled,
  });

  /**
   * This effect is used to delay the KPI stats fetching by 1 second.
   * This is done to allow the page to load first and then fetch the KPI stats.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnabled(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const KPIs: TKPIS = [
    {
      figure: data?.total_models_published ?? 0,
      label: SHARED_CONTENT.homepage.kpi.publishedAIModels,
    },
    {
      figure: data?.total_registered_users ?? 0,
      label: SHARED_CONTENT.homepage.kpi.totalUsers,
    },
    {
      figure: data?.total_feedback_labels ?? 0,
      label: SHARED_CONTENT.homepage.kpi.humanFeedback,
    },
    {
      figure: data?.total_accepted_predictions ?? 0,
      label: SHARED_CONTENT.homepage.kpi.acceptedPrediction,
    },
  ];

  return (
    <section className={styles.kpiContainer}>
      {KPIs.map((kpi, id) => (
        <div key={`kpi-${id}`} className={styles.kpiItem}>
          <h1 className={`${isLoading || isError ? "animate-pulse" : ""}`}>
            {kpi.figure?.toLocaleString()}
          </h1>
          <h3>{kpi.label}</h3>
        </div>
      ))}
    </section>
  );
};
