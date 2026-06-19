import type { Repository, GithubToken, RepoFilterParams } from "@/types/app/repository";
import {
  getRepositoriesApi,
  getRepositoryApi,
  syncRepositoriesApi,
  getGithubTokensApi,
  createGithubTokenApi,
  deleteGithubTokenApi,
  getGithubOAuthConnectUrlApi,
} from "@/lib/api/api-main";
import type { GithubTokenResponse } from "@/types/api/main/repository";

const mapGithubToken = (token: GithubTokenResponse): GithubToken => ({
  ...token,
  expiresAt: token.expiresAt ?? null,
});

export const getRepositories = async (
  params?: RepoFilterParams,
): Promise<{ items: Repository[]; total: number; totalPages: number; pageNumber: number }> => {
  const res = await getRepositoriesApi(params);
  const data = res.data?.data;
  return {
    items: data?.content ?? [],
    total: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 1,
    pageNumber: data?.pageNumber ?? 0,
  };
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
  if (!res.data?.data) throw new Error("Invalid response from server");
  return mapGithubToken(res.data.data);
};

export const deleteGithubToken = async (id: string): Promise<void> => {
  await deleteGithubTokenApi(id);
};

export const getGithubOAuthConnectUrl = async (): Promise<string> => {
  const res = await getGithubOAuthConnectUrlApi();
  return res.data?.data?.url ?? "";
};
