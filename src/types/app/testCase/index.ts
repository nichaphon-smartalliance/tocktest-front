import type {
  TestType,
  TestStatus,
  PriorityLevel,
  TestStep,
} from "@/types/api/main/testCase";

export type { TestType, TestStatus, PriorityLevel, TestStep };

export type ModalMode = "create" | "edit" | "view";

export interface TestCaseFolder {
  id: string;
  name: string;
  parentId: string | null;
  orderIndex: number;
  children?: TestCaseFolder[];
  testCaseCount?: number;
}

export interface TestCase {
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
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseFormValues {
  title: string;
  description?: string;
  steps?: TestStep[];
  expectedResult?: string;
  testType: TestType;
  status: TestStatus;
  priority: PriorityLevel;
  folderId?: string;
  tags?: string[];
}

export interface AiGenerateFormValues {
  fromDate?: string;
  toDate?: string;
  commitShas?: string[];
}

export interface GeneratedTestCasePreview {
  title: string;
  description: string | null;
  steps: TestStep[] | null;
  expectedResult: string | null;
  testType: TestType;
  priority: PriorityLevel;
  tags: string[];
  selected: boolean;
}

export interface TestCaseFilterParams {
  folderId?: string;
  status?: TestStatus;
  testType?: TestType;
  priority?: PriorityLevel;
  search?: string;
  page?: number;
  pageSize?: number;
}
