import type { TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";

export const STATUS_CONFIG: Record<TestStatus, { label: string; color: string }> = {
  pass: { label: "ผ่าน", color: "green" },
  fail: { label: "ไม่ผ่าน", color: "red" },
  blocked: { label: "ติดขัด", color: "orange" },
  not_tested: { label: "ยังไม่ทดสอบ", color: "default" },
};

export const TYPE_CONFIG: Record<TestType, { label: string; color: string }> = {
  manual: { label: "Manual", color: "blue" },
  automated: { label: "Auto", color: "purple" },
  ui: { label: "UI", color: "cyan" },
  api: { label: "API", color: "geekblue" },
  integration: { label: "Integration", color: "magenta" },
};

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; color: string }> = {
  low: { label: "ต่ำ", color: "default" },
  medium: { label: "กลาง", color: "blue" },
  high: { label: "สูง", color: "orange" },
  critical: { label: "วิกฤต", color: "red" },
};

export const TEST_CASE_STORAGE_KEY = "test-case-filters";
export const DEFAULT_TC_FILTERS = { search: "", status: "", testType: "", priority: "" };
