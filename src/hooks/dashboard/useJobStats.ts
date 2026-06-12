"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobStatsApi } from "@/lib/api/api-main";

export const useJobStats = () =>
  useQuery({
    queryKey: ["jobStats"],
    queryFn: async () => (await getJobStatsApi()).data?.data,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
