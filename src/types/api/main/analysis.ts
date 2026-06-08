export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface CommitResponse {
  id: string;
  repoId: string;
  commitSha: string;
  commitMessage: string;
  authorName: string;
  authorEmail: string;
  committedAt: string;
  aiSummary: string | null;
  riskLevel: RiskLevel | null;
  filesChanged: number;
  additions: number;
  deletions: number;
  analyzedAt: string | null;
}

export interface AiAnalysisResponse {
  summary: string;
  riskLevel: RiskLevel;
  testSuggestions: string[];
  affectedAreas: string[];
}

export interface WhatToTestResponse {
  recommendations: string[];
  priority: "low" | "medium" | "high";
  reasoning: string;
}
