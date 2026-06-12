"use client";

import { useQuery } from "@tanstack/react-query";
import { getGithubAppSetup, getGithubAppInstallUrl, getGithubAppInstallations } from "@/services/dashboard.service";

export const GITHUB_APP_SETUP_QUERY_KEY = ["githubAppSetup"] as const;
export const GITHUB_APP_INSTALLATIONS_QUERY_KEY = ["githubAppInstallations"] as const;

export const useGithubAppSetup = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: GITHUB_APP_SETUP_QUERY_KEY,
    queryFn: getGithubAppSetup,
    staleTime: 60_000,
  });

  const { data: installations, isLoading: installationsLoading, refetch: refetchInstallations } = useQuery({
    queryKey: GITHUB_APP_INSTALLATIONS_QUERY_KEY,
    queryFn: getGithubAppInstallations,
    enabled: !!data?.configured,
  });

  const installApp = async () => {
    const url = await getGithubAppInstallUrl();
    if (url) window.location.href = url;
  };

  return {
    setup: data,
    isLoading,
    refetch,
    installations: installations ?? [],
    installationsLoading,
    refetchInstallations,
    installApp,
  };
};
