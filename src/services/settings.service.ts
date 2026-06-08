import { mainClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api/main/common";
import type { RepoSettingsResponse } from "@/types/api/main/settings";

export const getRepoSettings = async (repoId: string) => {
  const res = await mainClient.get<ApiResponse<RepoSettingsResponse>>(
    `/api/v1/repositories/${repoId}/settings`
  );
  return res.data?.data ?? null;
};

export const updateRepoSettings = async (repoId: string, body: Partial<RepoSettingsResponse>) => {
  const res = await mainClient.put<ApiResponse<RepoSettingsResponse>>(
    `/api/v1/repositories/${repoId}/settings`,
    body
  );
  return res.data.data;
};
