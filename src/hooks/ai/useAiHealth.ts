"use client";

import { useQuery } from "@tanstack/react-query";
import { aiHealthApi } from "@/lib/api/api-main";

/** Polls AI service availability so the UI can warn before users click AI features. */
export const useAiHealth = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["aiHealth"],
    queryFn: async () => (await aiHealthApi()).data?.data ?? { available: false },
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: 1,
  });
  return {
    aiAvailable: isLoading ? null : (data?.available ?? false),
  };
};
