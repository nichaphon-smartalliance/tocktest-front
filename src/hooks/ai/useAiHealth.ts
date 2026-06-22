"use client";

import { useQuery } from "@tanstack/react-query";
import { aiHealthApi } from "@/lib/api/api-main";

/** Polls AI service availability so the UI can warn before users click AI features. */
export const useAiHealth = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["aiHealth"],
    queryFn: async () => (await aiHealthApi()).data?.data ?? { available: false },
    refetchInterval: 5 * 60_000,
    staleTime: 5 * 60_000,
    retry: false,
  });
  return {
    aiAvailable: isLoading ? null : (data?.available ?? false),
  };
};
