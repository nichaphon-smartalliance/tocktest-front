"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectDoc, getDocStatus, updateProjectDoc, generateDoc, refreshDoc, autoUpdateDoc, getDocVersions, deleteProjectDoc } from "@/services/docs.service";

export const PROJECT_DOC_QUERY_KEY = ["projectDoc"] as const;
export const PROJECT_DOC_STATUS_QUERY_KEY = ["projectDocStatus"] as const;

export const useProjectDoc = (repoId: string) => {
  const qc = useQueryClient();
  const key = useMemo(() => [...PROJECT_DOC_QUERY_KEY, repoId], [repoId]);
  const lastSuccessAt = useRef<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => getProjectDoc(repoId),
    enabled: !!repoId,
  });

  const { data: versions } = useQuery({
    queryKey: [...key, "versions"],
    queryFn: () => getDocVersions(repoId),
    enabled: !!repoId,
  });

  const { data: status, isLoading: isLoadingStatus } = useQuery({
    queryKey: [...PROJECT_DOC_STATUS_QUERY_KEY, repoId],
    queryFn: () => getDocStatus(repoId),
    enabled: !!repoId,
    refetchInterval: (q) => {
      const current = q.state.data as Awaited<ReturnType<typeof getDocStatus>> | undefined;
      return current?.status === "queued" || current?.status === "running" || current?.autoSync ? 4000 : false;
    },
  });

  useEffect(() => {
    if (status?.status !== "success" || !status.lastGeneratedAt) return;
    if (lastSuccessAt.current === status.lastGeneratedAt) return;
    lastSuccessAt.current = status.lastGeneratedAt;
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: [...key, "versions"] });
  }, [key, qc, status]);

  const updateMutation = useMutation({
    mutationFn: (content: string) => updateProjectDoc(repoId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: [...key, "versions"] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => generateDoc(repoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...PROJECT_DOC_STATUS_QUERY_KEY, repoId] }),
  });

  const refreshMutation = useMutation({
    mutationFn: () => refreshDoc(repoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...PROJECT_DOC_STATUS_QUERY_KEY, repoId] }),
  });

  const autoUpdateMutation = useMutation({
    mutationFn: () => autoUpdateDoc(repoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...PROJECT_DOC_STATUS_QUERY_KEY, repoId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProjectDoc(repoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: [...key, "versions"] });
      qc.invalidateQueries({ queryKey: [...PROJECT_DOC_STATUS_QUERY_KEY, repoId] });
    },
  });

  return {
    doc: data,
    isLoading,
    status,
    isLoadingStatus,
    versions: versions ?? [],
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    refresh: refreshMutation.mutateAsync,
    isRefreshing: refreshMutation.isPending,
    autoUpdate: autoUpdateMutation.mutateAsync,
    isAutoUpdating: autoUpdateMutation.isPending,
    deleteDoc: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
