import type { ProjectDoc, DocVersion, DocStatus } from "@/types/app/docs";
import { getProjectDocApi, getDocStatusApi, updateProjectDocApi, getDocVersionsApi, generateDocApi, refreshDocApi, autoUpdateDocApi, deleteProjectDocApi } from "@/lib/api/api-main";

export const getProjectDoc = async (repoId: string): Promise<ProjectDoc | null> => {
  const res = await getProjectDocApi(repoId);
  return res.data?.data ?? null;
};

export const updateProjectDoc = async (repoId: string, content: string): Promise<ProjectDoc> => {
  const res = await updateProjectDocApi(repoId, content);
  if (!res.data?.data) throw new Error("Invalid response from server");
  return res.data.data;
};

export const getDocVersions = async (repoId: string): Promise<DocVersion[]> => {
  const res = await getDocVersionsApi(repoId);
  return res.data?.data ?? [];
};

export const getDocStatus = async (repoId: string): Promise<DocStatus> => {
  const res = await getDocStatusApi(repoId);
  if (!res.data?.data) throw new Error("Invalid response from server");
  return res.data.data;
};

export const generateDoc = async (repoId: string): Promise<DocStatus> => {
  const res = await generateDocApi(repoId);
  if (!res.data?.data) throw new Error("Invalid response from server");
  return res.data.data;
};

export const refreshDoc = async (repoId: string): Promise<DocStatus> => {
  const res = await refreshDocApi(repoId);
  if (!res.data?.data) throw new Error("Invalid response from server");
  return res.data.data;
};

export const autoUpdateDoc = async (repoId: string): Promise<DocStatus> => {
  const res = await autoUpdateDocApi(repoId);
  if (!res.data?.data) throw new Error("Invalid response from server");
  return res.data.data;
};

export const deleteProjectDoc = async (repoId: string): Promise<void> => {
  await deleteProjectDocApi(repoId);
};
