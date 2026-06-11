import { getRepoSettingsApi, updateRepoSettingsApi } from "@/lib/api/api-main";
import type { RepoSettingsResponse } from "@/types/api/main/settings";

export const getRepoSettings = async (repoId: string) => {
  const res = await getRepoSettingsApi(repoId);
  return res.data?.data ?? null;
};

type UpdateRepoSettingsBody = Pick<
  RepoSettingsResponse,
  "defaultBranch" | "autoAnalyzeOnPush" | "aiProvider" | "aiModel"
>;

export const updateRepoSettings = async (repoId: string, body: Partial<UpdateRepoSettingsBody>) => {
  const res = await updateRepoSettingsApi(repoId, body);
  return res.data?.data ?? null;
};
