import type { CommitItem, AnalysisFilterParams } from "@/types/app/analysis";
import { getCommitsApi, analyzeCommitApi, getWhatToTestApi } from "@/lib/api/api-main";
import { getRepositoryBranchesApi } from "@/lib/api/api-main";

export const getCommits = async (repoId: string, params?: AnalysisFilterParams): Promise<{ items: CommitItem[]; total: number }> => {
  const res = await getCommitsApi(repoId, params as Record<string, unknown>);
  const data = res.data?.data;
  return { items: data?.content ?? [], total: data?.totalElements ?? 0 };
};

export const analyzeCommit = async (repoId: string, commitSha: string) => {
  const res = await analyzeCommitApi(repoId, commitSha);
  return res.data?.data;
};

export const getWhatToTest = async (repoId: string, commitShas: string[]) => {
  const res = await getWhatToTestApi(repoId, commitShas);
  return res.data?.data;
};

export const getBranches = async (repoId: string) => {
  const res = await getRepositoryBranchesApi(repoId);
  return res.data?.data ?? [];
};
