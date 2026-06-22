"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentJobs } from "@/services/dashboard.service";

export const useRecentJobs = () =>
  useQuery({
    queryKey: ["recentJobs"],
    queryFn: getRecentJobs,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
