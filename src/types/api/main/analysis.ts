export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface CommitResponse {
  id: string;
  repoId: string;
  commitSha: string;
  commitMessage: string | null;
  authorName: string | null;
  authorEmail: string | null;
  committedAt: string | null;
  aiSummary: string | null;
  riskLevel: RiskLevel | null;
  filesChanged: number;
  additions: number;
  deletions: number;
  analyzedAt: string | null;
}

export type AiResponseSource = "ai" | "heuristic";

export interface AiAnalysisResponse {
  summary: string;
  riskLevel: RiskLevel;
  testSuggestions: string[];
  affectedAreas: string[];
  source?: AiResponseSource;
}

export interface WhatToTestResponse {
  recommendations: string[];
  priority: "low" | "medium" | "high";
  reasoning: string;
  source?: AiResponseSource;
}

export interface PullRequestReviewFinding {
  file: string | null;
  severity: RiskLevel;
  title: string;
  comment: string;
  suggestion: string;
}

export interface PullRequestReviewResponse {
  summary: string;
  riskLevel: RiskLevel;
  findings: PullRequestReviewFinding[];
  mergeRecommendation: "approve" | "comment" | "request_changes";
  source?: AiResponseSource;
}
