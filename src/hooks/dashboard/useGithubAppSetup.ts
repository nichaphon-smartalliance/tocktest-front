"use client";

import { useQuery } from "@tanstack/react-query";
import { getGithubAppSetup } from "@/services/dashboard.service";

export const GITHUB_APP_SETUP_QUERY_KEY = ["githubAppSetup"] as const;

export const useGithubAppSetup = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: GITHUB_APP_SETUP_QUERY_KEY,
    queryFn: getGithubAppSetup,
    staleTime: 60_000,
  });

  return { setup: data, isLoading, refetch };
};
