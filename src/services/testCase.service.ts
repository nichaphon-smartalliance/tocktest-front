import type { TestCase, TestCaseFolder, TestCaseFormValues, GeneratedTestCasePreview, TestCaseFilterParams } from "@/types/app/testCase";
import type { AiGenerateRequest } from "@/types/api/main/testCase";
import {
  getTestCaseFoldersApi,
  createFolderApi,
  updateFolderApi,
  deleteFolderApi,
  getTestCasesApi,
  createTestCaseApi,
  updateTestCaseApi,
  deleteTestCaseApi,
  aiGenerateTestCasesApi,
  bulkSaveTestCasesApi,
} from "@/lib/api/api-main";

export const getTestCaseFolders = async (repoId: string): Promise<TestCaseFolder[]> => {
  const res = await getTestCaseFoldersApi(repoId);
  return res.data?.data ?? [];
};

export const createFolder = async (repoId: string, name: string, parentId?: string): Promise<TestCaseFolder> => {
  const res = await createFolderApi(repoId, { name, parentId });
  return res.data.data;
};

export const updateFolder = async (repoId: string, folderId: string, name: string): Promise<TestCaseFolder> => {
  const res = await updateFolderApi(repoId, folderId, { name });
  return res.data.data;
};

export const deleteFolder = async (repoId: string, folderId: string): Promise<void> => {
  await deleteFolderApi(repoId, folderId);
};

export const getTestCases = async (repoId: string, params?: TestCaseFilterParams): Promise<{ items: TestCase[]; total: number }> => {
  const res = await getTestCasesApi(repoId, params as Record<string, unknown>);
  const data = res.data?.data;
  return { items: data?.content ?? [], total: data?.totalElements ?? 0 };
};

export const createTestCase = async (repoId: string, values: TestCaseFormValues): Promise<TestCase> => {
  const res = await createTestCaseApi(repoId, values);
  return res.data.data;
};

export const updateTestCase = async (repoId: string, id: string, values: Partial<TestCaseFormValues>): Promise<TestCase> => {
  const res = await updateTestCaseApi(repoId, id, values);
  return res.data.data;
};

export const deleteTestCase = async (repoId: string, id: string): Promise<void> => {
  await deleteTestCaseApi(repoId, id);
};

export const aiGenerateTestCases = async (req: AiGenerateRequest): Promise<GeneratedTestCasePreview[]> => {
  const res = await aiGenerateTestCasesApi(req);
  return (res.data?.data?.testCases ?? []).map((tc) => ({ ...tc, selected: true }));
};

export const bulkSaveTestCases = async (repoId: string, previews: GeneratedTestCasePreview[]): Promise<TestCase[]> => {
  const selected = previews.filter((p) => p.selected);
  const res = await bulkSaveTestCasesApi(repoId, selected);
  return res.data?.data ?? [];
};
