"use client";

import { useQuery } from "@tanstack/react-query";
import { getRepository } from "@/services/repository.service";

export const REPOSITORY_QUERY_KEY = ["repository"] as const;

export const useRepository = (id: string) => {
  const { data, isLoading } = useQuery({
    queryKey: [...REPOSITORY_QUERY_KEY, id],
    queryFn: () => getRepository(id),
    enabled: !!id,
  });

  return { repository: data, isLoading };
};
