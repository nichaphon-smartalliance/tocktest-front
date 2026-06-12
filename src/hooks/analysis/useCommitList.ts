"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommits, analyzeCommit, getWhatToTest, getBranches, reviewPullRequest, reviewAndCommentPullRequest } from "@/services/analysis.service";
import type { CommitItem, AnalysisFilterParams } from "@/types/app/analysis";
import type { AiAnalysisResponse } from "@/types/api/main/analysis";

export const COMMIT_LIST_QUERY_KEY = ["commitList"] as const;
export const BRANCHES_QUERY_KEY = ["branches"] as const;

type CommitListData = { items: CommitItem[]; total: number };

const patchCommitAfterAnalyze = (
  old: CommitListData | undefined,
  commitSha: string,
  data: AiAnalysisResponse
): CommitListData | undefined => {
  if (!old) return old;
  return {
    ...old,
    items: old.items.map((item) =>
      item.commitSha === commitSha
        ? {
            ...item,
            aiSummary: data.summary ?? item.aiSummary,
            riskLevel: data.riskLevel ?? item.riskLevel,
            analyzedAt: new Date().toISOString(),
          }
        : item
    ),
  };
};

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
    staleTime: 10 * 60_000,
  });

  const analyzeMutation = useMutation({
    mutationFn: (commitSha: string) => analyzeCommit(repoId, commitSha),
    onSuccess: (data, commitSha) => {
      if (data) {
        qc.setQueriesData<CommitListData>(
          { queryKey: [...COMMIT_LIST_QUERY_KEY, repoId] },
          (old) => patchCommitAfterAnalyze(old, commitSha, data)
        );
      }
    },
  });

  const whatToTestMutation = useMutation({
    mutationFn: (commitShas: string[]) => getWhatToTest(repoId, commitShas),
  });

  const pullRequestReviewMutation = useMutation({
    mutationFn: (pullRequestNumber: number) => reviewPullRequest(repoId, pullRequestNumber),
  });

  const pullRequestReviewCommentMutation = useMutation({
    mutationFn: (pullRequestNumber: number) => reviewAndCommentPullRequest(repoId, pullRequestNumber),
  });

  return {
    commits: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    branches: branches ?? [],
    branchesLoading,
    analyze: analyzeMutation.mutateAsync,
    getWhatToTest: whatToTestMutation.mutateAsync,
    whatToTestResult: whatToTestMutation.data,
    isLoadingWhatToTest: whatToTestMutation.isPending,
    reviewPullRequest: pullRequestReviewMutation.mutateAsync,
    pullRequestReviewResult: pullRequestReviewMutation.data,
    isReviewingPullRequest: pullRequestReviewMutation.isPending,
    reviewAndCommentPullRequest: pullRequestReviewCommentMutation.mutateAsync,
    isPostingPullRequestReview: pullRequestReviewCommentMutation.isPending,
  };
};
