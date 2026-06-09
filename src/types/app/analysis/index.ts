import type { RiskLevel } from "@/types/api/main/analysis";
export type { RiskLevel };

export interface CommitItem {
  id: string;
  commitSha: string;
  commitMessage: string;
  authorName: string;
  committedAt: string;
  aiSummary: string | null;
  riskLevel: RiskLevel | null;
  filesChanged: number;
  additions: number;
  deletions: number;
  analyzedAt: string | null;
}

export interface AnalysisFilterParams {
  fromDate?: string;
  toDate?: string;
  riskLevel?: RiskLevel;
  branch?: string;
  page?: number;
  pageSize?: number;
}
