export type TestType = "manual" | "automated" | "ui" | "api" | "integration";
export type TestStatus = "pass" | "fail" | "blocked" | "not_tested";
export type PriorityLevel = "low" | "medium" | "high" | "critical";

export interface TestStep {
  order: number;
  description: string;
}

export interface TestCaseFolderResponse {
  id: string;
  repoId: string;
  name: string;
  parentId: string | null;
  orderIndex: number;
  children?: TestCaseFolderResponse[];
  testCaseCount?: number;
  createdAt: string;
}

export interface TestCaseResponse {
  id: string;
  repoId: string;
  folderId: string | null;
  title: string;
  description: string | null;
  steps: TestStep[] | null;
  expectedResult: string | null;
  testType: TestType;
  status: TestStatus;
  priority: PriorityLevel;
  isAiGenerated: boolean;
  aiGenerationMetadata: Record<string, unknown> | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AiGenerateRequest {
  repoId: string;
  fromDate?: string;
  toDate?: string;
  commitShas?: string[];
}

export interface AiGenerateResponse {
  testCases: Omit<TestCaseResponse, "id" | "repoId" | "createdAt" | "updatedAt">[];
  logId: string;
  model: string;
  tokensUsed: number;
}
