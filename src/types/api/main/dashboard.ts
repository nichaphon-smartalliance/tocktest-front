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

export interface QaRecentRepoResponse {
  id: string;
  fullName: string;
  testCaseCount: number;
  failCount: number;
  passCount: number;
  lastSyncedAt: string | null;
}
