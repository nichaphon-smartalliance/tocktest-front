"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTestCaseFolders, createFolder, updateFolder, deleteFolder } from "@/services/testCase.service";

export const FOLDERS_QUERY_KEY = ["testCaseFolders"] as const;

export const useTestCaseFolders = (repoId: string) => {
  const qc = useQueryClient();
  const key = [...FOLDERS_QUERY_KEY, repoId];

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => getTestCaseFolders(repoId),
    enabled: !!repoId,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId?: string }) =>
      createFolder(repoId, name, parentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ folderId, name }: { folderId: string; name: string }) =>
      updateFolder(repoId, folderId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteMutation = useMutation({
    mutationFn: (folderId: string) => deleteFolder(repoId, folderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    folders: data ?? [],
    isLoading,
    createFolder: createMutation.mutateAsync,
    updateFolder: updateMutation.mutateAsync,
    deleteFolder: deleteMutation.mutateAsync,
  };
};
