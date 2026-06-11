import type { ApiResponse, PageObject } from "@/types/api/main/common";
import type { RepositoryResponse, GithubTokenResponse, SyncRepositoriesResponse } from "@/types/api/main/repository";
import type {
  TestCaseFolderResponse,
  TestCaseResponse,
  AiGenerateRequest,
  AiGenerateResponse,
} from "@/types/api/main/testCase";
import type { CommitResponse, AiAnalysisResponse, WhatToTestResponse } from "@/types/api/main/analysis";
import type { ProjectDocResponse, DocVersionResponse } from "@/types/api/main/docs";
import type { RepoSettingsResponse } from "@/types/api/main/settings";
import { mainClient } from "./client";

// ── Repositories ──────────────────────────────────────────────────────────
export const getRepositoriesApi = (params?: Record<string, unknown>) =>
  mainClient.get<ApiResponse<PageObject<RepositoryResponse>>>("/api/v1/repositories", { params });

export const getRepositoryApi = (id: string) =>
  mainClient.get<ApiResponse<RepositoryResponse>>(`/api/v1/repositories/${id}`);

export const getRepositoryBranchesApi = (id: string) =>
  mainClient.get<ApiResponse<{ name: string; commitSha: string }[]>>(`/api/v1/repositories/${id}/branches`);

export const syncRepositoriesApi = () =>
  mainClient.post<ApiResponse<SyncRepositoriesResponse>>("/api/v1/repositories/sync");

// ── GitHub Tokens ─────────────────────────────────────────────────────────
export const getGithubTokensApi = () =>
  mainClient.get<ApiResponse<GithubTokenResponse[]>>("/api/v1/github-tokens");

export const createGithubTokenApi = (body: { label: string; token: string }) =>
  mainClient.post<ApiResponse<GithubTokenResponse>>("/api/v1/github-tokens", body);

export const deleteGithubTokenApi = (id: string) =>
  mainClient.delete<ApiResponse<void>>(`/api/v1/github-tokens/${id}`);

export const testGithubTokenApi = (id: string) =>
  mainClient.post<ApiResponse<{ valid: boolean }>>(`/api/v1/github-tokens/${id}/test`);

// ── Test Case Folders ─────────────────────────────────────────────────────
export const getTestCaseFoldersApi = (repoId: string) =>
  mainClient.get<ApiResponse<TestCaseFolderResponse[]>>(`/api/v1/repositories/${repoId}/folders`);

export const createFolderApi = (repoId: string, body: { name: string; parentId?: string }) =>
  mainClient.post<ApiResponse<TestCaseFolderResponse>>(`/api/v1/repositories/${repoId}/folders`, body);

export const updateFolderApi = (repoId: string, folderId: string, body: { name: string }) =>
  mainClient.put<ApiResponse<TestCaseFolderResponse>>(`/api/v1/repositories/${repoId}/folders/${folderId}`, body);

export const deleteFolderApi = (repoId: string, folderId: string) =>
  mainClient.delete<ApiResponse<void>>(`/api/v1/repositories/${repoId}/folders/${folderId}`);

// ── Test Cases ────────────────────────────────────────────────────────────
export const getTestCasesApi = (repoId: string, params?: Record<string, unknown>) =>
  mainClient.get<ApiResponse<PageObject<TestCaseResponse>>>(`/api/v1/repositories/${repoId}/test-cases`, { params });

export const getTestCaseApi = (repoId: string, testCaseId: string) =>
  mainClient.get<ApiResponse<TestCaseResponse>>(`/api/v1/repositories/${repoId}/test-cases/${testCaseId}`);

export const createTestCaseApi = (repoId: string, body: Partial<TestCaseResponse>) =>
  mainClient.post<ApiResponse<TestCaseResponse>>(`/api/v1/repositories/${repoId}/test-cases`, body);

export const updateTestCaseApi = (repoId: string, testCaseId: string, body: Partial<TestCaseResponse>) =>
  mainClient.put<ApiResponse<TestCaseResponse>>(`/api/v1/repositories/${repoId}/test-cases/${testCaseId}`, body);

export const deleteTestCaseApi = (repoId: string, testCaseId: string) =>
  mainClient.delete<ApiResponse<void>>(`/api/v1/repositories/${repoId}/test-cases/${testCaseId}`);

export const aiGenerateTestCasesApi = (body: AiGenerateRequest) =>
  mainClient.post<ApiResponse<AiGenerateResponse>>("/api/v1/ai/generate-test-cases", body);

export const bulkSaveTestCasesApi = (repoId: string, testCases: Partial<TestCaseResponse>[]) =>
  mainClient.post<ApiResponse<TestCaseResponse[]>>(`/api/v1/repositories/${repoId}/test-cases/bulk`, { testCases });

// ── Analysis ──────────────────────────────────────────────────────────────
export const getCommitsApi = (repoId: string, params?: Record<string, unknown>) =>
  mainClient.get<ApiResponse<PageObject<CommitResponse>>>(`/api/v1/repositories/${repoId}/commits`, { params });

export const analyzeCommitApi = (repoId: string, commitSha: string) =>
  mainClient.post<ApiResponse<AiAnalysisResponse>>(`/api/v1/repositories/${repoId}/commits/${commitSha}/analyze`);

export const getWhatToTestApi = (repoId: string, commitShas: string[]) =>
  mainClient.post<ApiResponse<WhatToTestResponse>>(`/api/v1/repositories/${repoId}/what-to-test`, { commitShas });

// ── Project Docs ──────────────────────────────────────────────────────────
export const getProjectDocApi = (repoId: string) =>
  mainClient.get<ApiResponse<ProjectDocResponse>>(`/api/v1/repositories/${repoId}/docs`);

export const updateProjectDocApi = (repoId: string, content: string) =>
  mainClient.put<ApiResponse<ProjectDocResponse>>(`/api/v1/repositories/${repoId}/docs`, { content });

export const getDocVersionsApi = (repoId: string) =>
  mainClient.get<ApiResponse<DocVersionResponse[]>>(`/api/v1/repositories/${repoId}/docs/versions`);

export const autoUpdateDocApi = (repoId: string) =>
  mainClient.post<ApiResponse<ProjectDocResponse>>(`/api/v1/repositories/${repoId}/docs/auto-update`);

export const deleteProjectDocApi = (repoId: string) =>
  mainClient.delete<ApiResponse<void>>(`/api/v1/repositories/${repoId}/docs`);

// ── Repo Settings ─────────────────────────────────────────────────────────
export const getRepoSettingsApi = (repoId: string) =>
  mainClient.get<ApiResponse<RepoSettingsResponse>>(`/api/v1/repositories/${repoId}/settings`);

export const updateRepoSettingsApi = (repoId: string, body: Partial<RepoSettingsResponse>) =>
  mainClient.put<ApiResponse<RepoSettingsResponse>>(`/api/v1/repositories/${repoId}/settings`, body);
