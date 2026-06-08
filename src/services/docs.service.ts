import type { ProjectDoc, DocVersion } from "@/types/app/docs";
import { getProjectDocApi, updateProjectDocApi, getDocVersionsApi, autoUpdateDocApi } from "@/lib/api/api-main";

export const getProjectDoc = async (repoId: string): Promise<ProjectDoc | null> => {
  const res = await getProjectDocApi(repoId);
  return res.data?.data ?? null;
};

export const updateProjectDoc = async (repoId: string, content: string): Promise<ProjectDoc> => {
  const res = await updateProjectDocApi(repoId, content);
  return res.data.data;
};

export const getDocVersions = async (repoId: string): Promise<DocVersion[]> => {
  const res = await getDocVersionsApi(repoId);
  return res.data?.data ?? [];
};

export const autoUpdateDoc = async (repoId: string): Promise<ProjectDoc> => {
  const res = await autoUpdateDocApi(repoId);
  return res.data.data;
};
