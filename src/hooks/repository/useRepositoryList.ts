"use client";

import { useQuery } from "@tanstack/react-query";
import { getRepositories } from "@/services/repository.service";
import type { RepoFilterParams } from "@/types/app/repository";

export const REPOSITORY_LIST_QUERY_KEY = ["repositoryList"] as const;

export const useRepositoryList = (params?: RepoFilterParams) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: [...REPOSITORY_LIST_QUERY_KEY, params],
    queryFn: () => getRepositories(params),
  });

  return {
    repositories: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    pageNumber: data?.pageNumber ?? 0,
    isLoading,
    refetch,
  };
};
