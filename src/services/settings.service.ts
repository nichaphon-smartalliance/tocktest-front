import { getRepoSettingsApi, updateRepoSettingsApi } from "@/lib/api/api-main";
import type { RepoSettingsResponse } from "@/types/api/main/settings";

export const getRepoSettings = async (repoId: string) => {
  const res = await getRepoSettingsApi(repoId);
  return res.data?.data ?? null;
};

export const updateRepoSettings = async (repoId: string, body: Partial<RepoSettingsResponse>) => {
  const res = await updateRepoSettingsApi(repoId, body);
  return res.data.data;
};
