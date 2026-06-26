import type { ApiResponse, PageObject } from "@/types/api/main/common";
import type { RepoFilterParams } from "@/types/app/repository";
import type { RepositoryResponse, GithubTokenResponse, SyncRepositoriesResponse } from "@/types/api/main/repository";
import type {
  TestCaseFolderResponse,
  TestCaseResponse,
  AiGenerateRequest,
  AiGenerateResponse,
} from "@/types/api/main/testCase";
import type { CommitResponse, AiAnalysisResponse, PullRequestReviewResponse, WhatToTestResponse } from "@/types/api/main/analysis";
import type { ProjectDocResponse, DocVersionResponse, DocStatusResponse } from "@/types/api/main/docs";
import type { RepoSettingsResponse } from "@/types/api/main/settings";
import type { UserProfileResponse, UserSettingsResponse, UpdateUserSettingsRequest } from "@/types/api/main/user";
import type {
  BackgroundJobResponse,
  BackgroundJobStatsResponse,
  GithubAppSetupResponse,
  GithubAppInstallationResponse,
  GithubAppInstallationRepositoryResponse,
  QaSummaryResponse,
} from "@/types/api/main/dashboard";
import { mainClient } from "./client";

// ── Repositories ──────────────────────────────────────────────────────────
export const getRepositoriesApi = (params?: RepoFilterParams) =>
  mainClient.get<ApiResponse<PageObject<RepositoryResponse>>>("/repositories", { params });

export const getRepositoryApi = (id: string) =>
  mainClient.get<ApiResponse<RepositoryResponse>>(`/repositories/${id}`);

export const getRepositoryBranchesApi = (id: string) =>
  mainClient.get<ApiResponse<{ name: string; commitSha: string }[]>>(`/repositories/${id}/branches`);

export const syncRepositoriesApi = () =>
  mainClient.post<ApiResponse<SyncRepositoriesResponse>>("/repositories/sync");

// ── GitHub Tokens ─────────────────────────────────────────────────────────
export const getGithubTokensApi = () =>
  mainClient.get<ApiResponse<GithubTokenResponse[]>>("/github-tokens");

export const createGithubTokenApi = (body: { label: string; token: string }) =>
  mainClient.post<ApiResponse<GithubTokenResponse>>("/github-tokens", body);

export const deleteGithubTokenApi = (id: string) =>
  mainClient.delete<ApiResponse<void>>(`/github-tokens/${id}`);

export const testGithubTokenApi = (id: string) =>
  mainClient.post<ApiResponse<{ valid: boolean }>>(`/github-tokens/${id}/test`);

export const getGithubOAuthConnectUrlApi = () =>
  mainClient.get<ApiResponse<{ url: string }>>("/github-tokens/oauth/connect-url");

// ── Test Case Folders ─────────────────────────────────────────────────────
export const getTestCaseFoldersApi = (repoId: string) =>
  mainClient.get<ApiResponse<TestCaseFolderResponse[]>>(`/repositories/${repoId}/folders`);

export const createFolderApi = (repoId: string, body: { name: string; parentId?: string }) =>
  mainClient.post<ApiResponse<TestCaseFolderResponse>>(`/repositories/${repoId}/folders`, body);

export const updateFolderApi = (repoId: string, folderId: string, body: { name: string }) =>
  mainClient.put<ApiResponse<TestCaseFolderResponse>>(`/repositories/${repoId}/folders/${folderId}`, body);

export const deleteFolderApi = (repoId: string, folderId: string) =>
  mainClient.delete<ApiResponse<void>>(`/repositories/${repoId}/folders/${folderId}`);

// ── Test Cases ────────────────────────────────────────────────────────────
export const getTestCasesApi = (repoId: string, params?: Record<string, unknown>) =>
  mainClient.get<ApiResponse<PageObject<TestCaseResponse>>>(`/repositories/${repoId}/test-cases`, { params });

export const createTestCaseApi = (repoId: string, body: Partial<TestCaseResponse>) =>
  mainClient.post<ApiResponse<TestCaseResponse>>(`/repositories/${repoId}/test-cases`, body);

export const updateTestCaseApi = (repoId: string, testCaseId: string, body: Partial<TestCaseResponse>) =>
  mainClient.put<ApiResponse<TestCaseResponse>>(`/repositories/${repoId}/test-cases/${testCaseId}`, body);

export const deleteTestCaseApi = (repoId: string, testCaseId: string) =>
  mainClient.delete<ApiResponse<void>>(`/repositories/${repoId}/test-cases/${testCaseId}`);

export const aiGenerateTestCasesApi = (body: AiGenerateRequest) =>
  mainClient.post<ApiResponse<AiGenerateResponse>>("/ai/generate-test-cases", body, {
    timeout: 90_000,
  });

export const aiHealthApi = () =>
  mainClient.get<ApiResponse<{ available: boolean }>>("/ai/health");

export const bulkSaveTestCasesApi = (repoId: string, testCases: Partial<TestCaseResponse>[]) =>
  mainClient.post<ApiResponse<TestCaseResponse[]>>(`/repositories/${repoId}/test-cases/bulk`, { testCases });

// ── Analysis ──────────────────────────────────────────────────────────────
export const getCommitsApi = (repoId: string, params?: Record<string, unknown>) =>
  mainClient.get<ApiResponse<PageObject<CommitResponse>>>(`/repositories/${repoId}/commits`, { params });

export const analyzeCommitApi = (repoId: string, commitSha: string) =>
  mainClient.post<ApiResponse<AiAnalysisResponse>>(`/repositories/${repoId}/commits/${commitSha}/analyze`);

export const getWhatToTestApi = (repoId: string, commitShas: string[]) =>
  mainClient.post<ApiResponse<WhatToTestResponse>>(`/repositories/${repoId}/what-to-test`, { commitShas });

export const reviewPullRequestApi = (repoId: string, pullRequestNumber: number) =>
  mainClient.post<ApiResponse<PullRequestReviewResponse>>(`/repositories/${repoId}/pull-requests/${pullRequestNumber}/review`);

export const reviewAndCommentPullRequestApi = (repoId: string, pullRequestNumber: number) =>
  mainClient.post<ApiResponse<PullRequestReviewResponse>>(`/repositories/${repoId}/pull-requests/${pullRequestNumber}/review/comment`);

// ── Project Docs ──────────────────────────────────────────────────────────
export const getProjectDocApi = (repoId: string) =>
  mainClient.get<ApiResponse<ProjectDocResponse>>(`/repositories/${repoId}/docs`);

export const getDocStatusApi = (repoId: string) =>
  mainClient.get<ApiResponse<DocStatusResponse>>(`/repositories/${repoId}/docs/status`);

export const updateProjectDocApi = (repoId: string, content: string) =>
  mainClient.put<ApiResponse<ProjectDocResponse>>(`/repositories/${repoId}/docs`, { content });

export const getDocVersionsApi = (repoId: string) =>
  mainClient.get<ApiResponse<DocVersionResponse[]>>(`/repositories/${repoId}/docs/versions`);

export const generateDocApi = (repoId: string) =>
  mainClient.post<ApiResponse<DocStatusResponse>>(`/repositories/${repoId}/docs/gen`);

export const refreshDocApi = (repoId: string) =>
  mainClient.post<ApiResponse<DocStatusResponse>>(`/repositories/${repoId}/docs/refresh`);

export const autoUpdateDocApi = (repoId: string) =>
  mainClient.post<ApiResponse<DocStatusResponse>>(`/repositories/${repoId}/docs/auto-update`);

export const deleteProjectDocApi = (repoId: string) =>
  mainClient.delete<ApiResponse<void>>(`/repositories/${repoId}/docs`);

// ── Repo Settings ─────────────────────────────────────────────────────────
export const getRepoSettingsApi = (repoId: string) =>
  mainClient.get<ApiResponse<RepoSettingsResponse>>(`/repositories/${repoId}/settings`);

export const updateRepoSettingsApi = (repoId: string, body: Partial<RepoSettingsResponse>) =>
  mainClient.put<ApiResponse<RepoSettingsResponse>>(`/repositories/${repoId}/settings`, body);

// ── User / Admin Settings ─────────────────────────────────────────────────
export const getUserProfileApi = () =>
  mainClient.get<ApiResponse<UserProfileResponse>>("/users/me");

export const updateUserProfileApi = (body: { name: string }) =>
  mainClient.put<ApiResponse<UserProfileResponse>>("/users/me", body);

export const changeUserPasswordApi = (body: { currentPassword: string; newPassword: string }) =>
  mainClient.put<ApiResponse<{ success: boolean }>>("/users/me/password", body);

export const getUserSettingsApi = () =>
  mainClient.get<ApiResponse<UserSettingsResponse>>("/users/me/settings");

export const updateUserSettingsApi = (body: UpdateUserSettingsRequest) =>
  mainClient.put<ApiResponse<UserSettingsResponse>>("/users/me/settings", body);

// ── Dashboard / QA Summary ────────────────────────────────────────────────
export const getQaSummaryApi = () =>
  mainClient.get<ApiResponse<QaSummaryResponse>>("/dashboard/qa-summary");

export const getJobStatsApi = () =>
  mainClient.get<ApiResponse<BackgroundJobStatsResponse>>(
    "/jobs/stats",
  );

export const getRecentJobsApi = () =>
  mainClient.get<ApiResponse<BackgroundJobResponse[]>>("/jobs/recent");

export const getGithubAppSetupApi = () =>
  mainClient.get<ApiResponse<GithubAppSetupResponse>>("/github-app/setup");

export const getGithubAppInstallUrlApi = () =>
  mainClient.get<ApiResponse<{ url: string }>>("/github-app/install-url");

export const getGithubAppInstallationsApi = () =>
  mainClient.get<ApiResponse<GithubAppInstallationResponse[]>>("/github-app/installations");

export const getGithubAppInstallationRepositoriesApi = (installationId: string) =>
  mainClient.get<ApiResponse<GithubAppInstallationRepositoryResponse[]>>(
    `/github-app/installations/${installationId}/repositories`,
  );

export const importGithubAppInstallationRepositoryApi = (installationId: string, fullName: string) =>
  mainClient.post<ApiResponse<{ imported: boolean; fullName: string }>>(
    `/github-app/installations/${installationId}/repositories/import`,
    { fullName },
  );

// ── QA Chatbot ────────────────────────────────────────────────────────────
export const chatWithRepoApi = (
  repoId: string,
  body: { message: string; history?: { role: 'user' | 'assistant'; content: string }[]; language?: 'th' | 'en' },
) => mainClient.post<ApiResponse<{ response: string; repoId: string }>>(`/repositories/${repoId}/chat`, body, { timeout: 60_000 });

