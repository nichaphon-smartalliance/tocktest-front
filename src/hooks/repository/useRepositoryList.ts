"use client";

import { useQuery } from "@tanstack/react-query";
import { getRepositories } from "@/services/repository.service";

export const REPOSITORY_LIST_QUERY_KEY = ["repositoryList"] as const;

export const useRepositoryList = (params?: Record<string, unknown>) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...REPOSITORY_LIST_QUERY_KEY, params],
    queryFn: () => getRepositories(params),
  });

  return { repositories: data ?? [], isLoading, isError, error, refetch };
};
