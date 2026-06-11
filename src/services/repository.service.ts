import type { Repository, GithubToken } from "@/types/app/repository";
import {
  getRepositoriesApi,
  getRepositoryApi,
  syncRepositoriesApi,
  getGithubTokensApi,
  createGithubTokenApi,
  deleteGithubTokenApi,
  testGithubTokenApi,
} from "@/lib/api/api-main";
import type { GithubTokenResponse } from "@/types/api/main/repository";

const mapGithubToken = (token: GithubTokenResponse): GithubToken => ({
  ...token,
  expiresAt: token.expiresAt ?? null,
});

export const getRepositories = async (params?: Record<string, unknown>): Promise<Repository[]> => {
  const res = await getRepositoriesApi(params);
  return res.data?.data?.content ?? [];
};

export const getRepository = async (id: string): Promise<Repository | null> => {
  const res = await getRepositoryApi(id);
  return res.data?.data ?? null;
};

export const syncRepositories = async (): Promise<{ synced: number; total: number }> => {
  const res = await syncRepositoriesApi();
  return res.data?.data ?? { synced: 0, total: 0 };
};

export const getGithubTokens = async (): Promise<GithubToken[]> => {
  const res = await getGithubTokensApi();
  return (res.data?.data ?? []).map(mapGithubToken);
};

export const createGithubToken = async (label: string, token: string): Promise<GithubToken> => {
  const res = await createGithubTokenApi({ label, token });
  return mapGithubToken(res.data?.data);
};

export const deleteGithubToken = async (id: string): Promise<void> => {
  await deleteGithubTokenApi(id);
};

export const testGithubToken = async (id: string): Promise<boolean> => {
  const res = await testGithubTokenApi(id);
  return res.data?.data?.valid ?? false;
};
