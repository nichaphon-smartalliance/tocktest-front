export interface QaSummaryResponse {
  totalRepos: number;
  totalTestCases: number;
  byStatus: {
    pass: number;
    fail: number;
    blocked: number;
    not_tested: number;
  };
  aiGeneratedCount: number;
  failHighPriority: number;
  passRate: number;
  hasGithubToken: boolean;
  capabilities: QaCapabilityResponse[];
  nextMilestones: string[];
  recentRepos: QaRecentRepoResponse[];
}

export interface QaCapabilityResponse {
  key: string;
  label: string;
  status: "live" | "partial" | "missing";
  description: string;
}

export interface GithubAppSetupResponse {
  configured: boolean;
  appName: string | null;
  installUrl: string | null;
  appIdConfigured: boolean;
  privateKeyConfigured: boolean;
}

export interface GithubAppInstallationResponse {
  id: string;
  installationId: string;
  accountLogin: string | null;
  accountType: string | null;
  repositorySelection: string | null;
  suspendedAt: string | null;
  createdAt: string;
}

export interface GithubAppInstallationRepositoryResponse {
  githubRepoId: number;
  fullName: string;
  name: string;
  private: boolean;
  htmlUrl: string;
  defaultBranch: string;
  tracked: boolean;
  repositoryId: string | null;
}

export interface BackgroundJobStatsResponse {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface BackgroundJobResponse {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  maxAttempts: number;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  lastError: string | null;
  createdAt: string;
}

export interface QaRecentRepoResponse {
  id: string;
  fullName: string;
  testCaseCount: number;
  failCount: number;
  passCount: number;
  lastSyncedAt: string | null;
}
