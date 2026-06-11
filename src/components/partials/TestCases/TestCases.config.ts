import type { TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";

type ChipColor = "success" | "warning" | "danger" | "accent" | undefined;

export const CHIP_SOFT_CLASS: Record<NonNullable<ChipColor> | "default", string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-700 dark:text-red-400",
  accent: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  default: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

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
