"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api-error";
import { message } from "@/lib/toast";
import {
  getGithubTokens,
  createGithubToken,
  deleteGithubToken,
  syncRepositories,
  getGithubOAuthConnectUrl,
} from "@/services/repository.service";

export const GITHUB_TOKENS_QUERY_KEY = ["githubTokens"] as const;

export const useGithubTokens = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: GITHUB_TOKENS_QUERY_KEY,
    queryFn: getGithubTokens,
  });

  const createMutation = useMutation({
    mutationFn: ({ label, token }: { label: string; token: string }) =>
      createGithubToken(label, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: GITHUB_TOKENS_QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGithubToken,
    onSuccess: () => qc.invalidateQueries({ queryKey: GITHUB_TOKENS_QUERY_KEY }),
  });

  const syncMutation = useMutation({
    mutationFn: syncRepositories,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["repositoryList"] }),
  });

  const connectGithub = async () => {
    try {
      const url = await getGithubOAuthConnectUrl();
      if (url) window.location.href = url;
    } catch (error) {
      message.error(getApiErrorMessage(error, "Failed to connect GitHub."));
    }
  };

  return {
    tokens: data ?? [],
    isLoading,
    createToken: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteToken: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    syncRepositories: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    connectGithub,
  };
};
