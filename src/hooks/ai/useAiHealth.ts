"use client";

import { useQuery } from "@tanstack/react-query";
import { aiHealthApi } from "@/lib/api/api-main";

/** Polls AI service availability so the UI can warn before users click AI features. */
export const useAiHealth = () => {
  const { data } = useQuery({
    queryKey: ["aiHealth"],
    queryFn: async () => (await aiHealthApi()).data?.data ?? { available: false },
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: false,
  });
  return { aiAvailable: data?.available ?? true };
};
