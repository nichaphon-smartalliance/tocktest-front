import type { ApiResponse, PageObject } from "@/types/api/main/common";
import type { RepositoryResponse, GithubTokenResponse, SyncRepositoriesResponse } from "@/types/api/main/repository";
import type {
  TestCaseFolderResponse,
  TestCaseResponse,
  AiGenerateRequest,
  AiGenerateResponse,
} from "@/types/api/main/testCase";
import type { CommitResponse, AiAnalysisResponse, PullRequestReviewResponse, WhatToTestResponse } from "@/types/api/main/analysis";
import type { ProjectDocResponse, DocVersionResponse } from "@/types/api/main/docs";
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

export const getGithubOAuthConnectUrlApi = () =>
  mainClient.get<ApiResponse<{ url: string }>>("/api/v1/github-tokens/oauth/connect-url");

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
  mainClient.post<ApiResponse<AiGenerateResponse>>("/api/v1/ai/generate-test-cases", body, {
    timeout: 90_000,
  });

export const aiHealthApi = () =>
  mainClient.get<ApiResponse<{ available: boolean }>>("/api/v1/ai/health");

export const bulkSaveTestCasesApi = (repoId: string, testCases: Partial<TestCaseResponse>[]) =>
  mainClient.post<ApiResponse<TestCaseResponse[]>>(`/api/v1/repositories/${repoId}/test-cases/bulk`, { testCases });

// ── Analysis ──────────────────────────────────────────────────────────────
export const getCommitsApi = (repoId: string, params?: Record<string, unknown>) =>
  mainClient.get<ApiResponse<PageObject<CommitResponse>>>(`/api/v1/repositories/${repoId}/commits`, { params });

export const analyzeCommitApi = (repoId: string, commitSha: string) =>
  mainClient.post<ApiResponse<AiAnalysisResponse>>(`/api/v1/repositories/${repoId}/commits/${commitSha}/analyze`);

export const getWhatToTestApi = (repoId: string, commitShas: string[]) =>
  mainClient.post<ApiResponse<WhatToTestResponse>>(`/api/v1/repositories/${repoId}/what-to-test`, { commitShas });

export const reviewPullRequestApi = (repoId: string, pullRequestNumber: number) =>
  mainClient.post<ApiResponse<PullRequestReviewResponse>>(`/api/v1/repositories/${repoId}/pull-requests/${pullRequestNumber}/review`);

export const reviewAndCommentPullRequestApi = (repoId: string, pullRequestNumber: number) =>
  mainClient.post<ApiResponse<PullRequestReviewResponse>>(`/api/v1/repositories/${repoId}/pull-requests/${pullRequestNumber}/review/comment`);

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

// ── User / Admin Settings ─────────────────────────────────────────────────
export const getUserProfileApi = () =>
  mainClient.get<ApiResponse<UserProfileResponse>>("/api/v1/users/me");

export const updateUserProfileApi = (body: { name: string }) =>
  mainClient.put<ApiResponse<UserProfileResponse>>("/api/v1/users/me", body);

export const changeUserPasswordApi = (body: { currentPassword: string; newPassword: string }) =>
  mainClient.put<ApiResponse<{ success: boolean }>>("/api/v1/users/me/password", body);

export const getUserSettingsApi = () =>
  mainClient.get<ApiResponse<UserSettingsResponse>>("/api/v1/users/me/settings");

export const updateUserSettingsApi = (body: UpdateUserSettingsRequest) =>
  mainClient.put<ApiResponse<UserSettingsResponse>>("/api/v1/users/me/settings", body);

// ── Dashboard / QA Summary ────────────────────────────────────────────────
export const getQaSummaryApi = () =>
  mainClient.get<ApiResponse<QaSummaryResponse>>("/api/v1/dashboard/qa-summary");

export const getJobStatsApi = () =>
  mainClient.get<ApiResponse<BackgroundJobStatsResponse>>(
    "/api/v1/jobs/stats",
  );

export const getRecentJobsApi = () =>
  mainClient.get<ApiResponse<BackgroundJobResponse[]>>("/api/v1/jobs/recent");

export const getGithubAppSetupApi = () =>
  mainClient.get<ApiResponse<GithubAppSetupResponse>>("/api/v1/github-app/setup");

export const getGithubAppInstallUrlApi = () =>
  mainClient.get<ApiResponse<{ url: string }>>("/api/v1/github-app/install-url");

export const getGithubAppInstallationsApi = () =>
  mainClient.get<ApiResponse<GithubAppInstallationResponse[]>>("/api/v1/github-app/installations");

export const getGithubAppInstallationRepositoriesApi = (installationId: string) =>
  mainClient.get<ApiResponse<GithubAppInstallationRepositoryResponse[]>>(
    `/api/v1/github-app/installations/${installationId}/repositories`,
  );

export const importGithubAppInstallationRepositoryApi = (installationId: string, fullName: string) =>
  mainClient.post<ApiResponse<{ imported: boolean; fullName: string }>>(
    `/api/v1/github-app/installations/${installationId}/repositories/import`,
    { fullName },
  );
