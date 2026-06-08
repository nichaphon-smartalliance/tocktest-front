"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRepoSettings, updateRepoSettings } from "@/services/settings.service";

export const REPO_SETTINGS_QUERY_KEY = ["repoSettings"] as const;

export const useRepoSettings = (repoId: string) => {
  const qc = useQueryClient();
  const key = [...REPO_SETTINGS_QUERY_KEY, repoId];

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => getRepoSettings(repoId),
    enabled: !!repoId,
  });

  const updateMutation = useMutation({
    mutationFn: (body: Parameters<typeof updateRepoSettings>[1]) =>
      updateRepoSettings(repoId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    settings: data,
    isLoading,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
