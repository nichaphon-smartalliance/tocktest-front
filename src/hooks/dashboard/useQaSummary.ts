"use client";

import { useQuery } from "@tanstack/react-query";
import { getQaSummary } from "@/services/dashboard.service";

export const QA_SUMMARY_QUERY_KEY = ["qaSummary"] as const;

export const useQaSummary = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: QA_SUMMARY_QUERY_KEY,
    queryFn: getQaSummary,
    staleTime: 60_000,
  });

  return { summary: data, isLoading, refetch };
};
