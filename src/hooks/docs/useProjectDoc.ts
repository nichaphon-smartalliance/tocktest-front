"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectDoc, updateProjectDoc, autoUpdateDoc, getDocVersions, deleteProjectDoc } from "@/services/docs.service";

export const PROJECT_DOC_QUERY_KEY = ["projectDoc"] as const;

export const useProjectDoc = (repoId: string) => {
  const qc = useQueryClient();
  const key = [...PROJECT_DOC_QUERY_KEY, repoId];

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => getProjectDoc(repoId),
    enabled: !!repoId,
  });

  const { data: versions, isLoading: isLoadingVersions } = useQuery({
    queryKey: [...key, "versions"],
    queryFn: () => getDocVersions(repoId),
    enabled: !!repoId,
  });

  const updateMutation = useMutation({
    mutationFn: (content: string) => updateProjectDoc(repoId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const autoUpdateMutation = useMutation({
    mutationFn: () => autoUpdateDoc(repoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProjectDoc(repoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    doc: data,
    isLoading,
    versions: versions ?? [],
    isLoadingVersions,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    autoUpdate: autoUpdateMutation.mutateAsync,
    isAutoUpdating: autoUpdateMutation.isPending,
    deleteDoc: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
