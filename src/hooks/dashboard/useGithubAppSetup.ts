"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGithubAppSetup,
  getGithubAppInstallUrl,
  getGithubAppInstallations,
  getGithubAppInstallationRepositories,
  importGithubAppInstallationRepository,
} from "@/services/dashboard.service";

export const GITHUB_APP_SETUP_QUERY_KEY = ["githubAppSetup"] as const;
export const GITHUB_APP_INSTALLATIONS_QUERY_KEY = ["githubAppInstallations"] as const;
export const GITHUB_APP_INSTALLATION_REPOS_QUERY_KEY = ["githubAppInstallationRepos"] as const;

export const useGithubAppSetup = () => {
  const { data, isLoading } = useQuery({
    queryKey: GITHUB_APP_SETUP_QUERY_KEY,
    queryFn: getGithubAppSetup,
    staleTime: 60_000,
  });

  const { data: installations, isLoading: installationsLoading } = useQuery({
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
    installations: installations ?? [],
    installationsLoading,
    installApp,
  };
};

export const useGithubAppInstallationRepositories = (installationId: string | null) => {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: [...GITHUB_APP_INSTALLATION_REPOS_QUERY_KEY, installationId],
    queryFn: () => getGithubAppInstallationRepositories(installationId as string),
    enabled: !!installationId,
  });

  const importMutation = useMutation({
    mutationFn: (fullName: string) =>
      importGithubAppInstallationRepository(installationId as string, fullName),
    onSuccess: () => {
      void refetch();
      void qc.invalidateQueries({ queryKey: ["repositoryList"] });
    },
  });

  return {
    repositories: data ?? [],
    isLoading,
    refetch,
    importRepository: importMutation.mutateAsync,
    isImporting: importMutation.isPending,
  };
};
