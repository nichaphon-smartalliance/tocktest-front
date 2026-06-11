import type { TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";

type ChipColor = "success" | "warning" | "danger" | "accent" | undefined;

export const STATUS_CONFIG: Record<TestStatus, { label: string; color: ChipColor }> = {
  pass: { label: "ผ่าน", color: "success" },
  fail: { label: "ไม่ผ่าน", color: "danger" },
  blocked: { label: "ติดขัด", color: "warning" },
  not_tested: { label: "ยังไม่ทดสอบ", color: undefined },
};

export const TYPE_CONFIG: Record<TestType, { label: string; color: ChipColor }> = {
  manual: { label: "Manual", color: "accent" },
  automated: { label: "Auto", color: "accent" },
  ui: { label: "UI", color: "accent" },
  api: { label: "API", color: "accent" },
  integration: { label: "Integration", color: "accent" },
};

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: ChipColor }> = {
  low: { label: "ต่ำ", color: undefined },
  medium: { label: "กลาง", color: "accent" },
  high: { label: "สูง", color: "warning" },
  critical: { label: "วิกฤต", color: "danger" },
};

export const TEST_CASE_STORAGE_KEY = "test-case-filters";
export const DEFAULT_TC_FILTERS = { search: "", status: "", testType: "", priority: "" };
