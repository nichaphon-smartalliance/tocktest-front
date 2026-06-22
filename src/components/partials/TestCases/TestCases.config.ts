import type { TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";

type ChipColor = "success" | "warning" | "danger" | "accent" | undefined;

export const CHIP_SOFT_CLASS: Record<NonNullable<ChipColor> | "default", string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-700 dark:text-red-400",
  accent: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  default: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export const CHIP_DOT_CLASS: Record<NonNullable<ChipColor> | "default", string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  accent: "bg-indigo-500",
  default: "bg-gray-400",
};

// labelKey points into the `testCases` i18n namespace; components translate at render time.
export const STATUS_CONFIG: Record<TestStatus, { labelKey: string; color: ChipColor }> = {
  pass: { labelKey: "status.pass", color: "success" },
  fail: { labelKey: "status.fail", color: "danger" },
  blocked: { labelKey: "status.blocked", color: "warning" },
  not_tested: { labelKey: "status.notTested", color: undefined },
};

export const TYPE_CONFIG: Record<TestType, { labelKey: string; color: ChipColor }> = {
  manual: { labelKey: "type.manual", color: "accent" },
  automated: { labelKey: "type.automated", color: "accent" },
  ui: { labelKey: "type.ui", color: "accent" },
  api: { labelKey: "type.api", color: "accent" },
  integration: { labelKey: "type.integration", color: "accent" },
};

export const PRIORITY_CONFIG: Record<PriorityLevel, { labelKey: string; color: ChipColor }> = {
  low: { labelKey: "priority.low", color: "success" },
  medium: { labelKey: "priority.medium", color: "accent" },
  high: { labelKey: "priority.high", color: "warning" },
  critical: { labelKey: "priority.critical", color: "danger" },
};
