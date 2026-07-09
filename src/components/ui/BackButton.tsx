"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallbackHref = "/dashboard",
  label,
  className = "",
}: BackButtonProps) {
  const router = useRouter();
  const t = useTranslations("common");
  const resolvedLabel = label ?? t("back");

  return (
    <button
      type="button"
      onClick={() => router.push(fallbackHref)}
      aria-label={resolvedLabel}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-white border border-[var(--border-subtle)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2a2d2e] transition-colors ${className}`}
    >
      <ArrowLeft size={16} />
      {resolvedLabel}
    </button>
  );
}
