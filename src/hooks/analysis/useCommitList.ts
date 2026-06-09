"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommits, analyzeCommit, getWhatToTest, getBranches } from "@/services/analysis.service";
import type { AnalysisFilterParams } from "@/types/app/analysis";

export const COMMIT_LIST_QUERY_KEY = ["commitList"] as const;
export const BRANCHES_QUERY_KEY = ["branches"] as const;

export const useCommitList = (repoId: string, params?: AnalysisFilterParams) => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [...COMMIT_LIST_QUERY_KEY, repoId, params],
    queryFn: () => getCommits(repoId, params),
    enabled: !!repoId,
  });

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: [...BRANCHES_QUERY_KEY, repoId],
    queryFn: () => getBranches(repoId),
    enabled: !!repoId,
  });

  const analyzeMutation = useMutation({
    mutationFn: (commitSha: string) => analyzeCommit(repoId, commitSha),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...COMMIT_LIST_QUERY_KEY, repoId] }),
  });

  const whatToTestMutation = useMutation({
    mutationFn: (commitShas: string[]) => getWhatToTest(repoId, commitShas),
  });

  return {
    commits: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    branches: branches ?? [],
    branchesLoading,
    analyze: analyzeMutation.mutateAsync,
    isAnalyzing: analyzeMutation.isPending,
    getWhatToTest: whatToTestMutation.mutateAsync,
    whatToTestResult: whatToTestMutation.data,
    isLoadingWhatToTest: whatToTestMutation.isPending,
  };
};
