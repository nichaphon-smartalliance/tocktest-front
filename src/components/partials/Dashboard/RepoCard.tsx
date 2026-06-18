"use client";

import { Card, Chip } from "@heroui/react";
import { Lock, Globe, Package, GitBranch, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import type { Repository } from "@/types/app/repository";

dayjs.extend(relativeTime);

interface RepoCardProps {
  repo: Repository;
  qaStats?: { testCaseCount: number; failCount: number };
}

export default function RepoCard({ repo, qaStats }: RepoCardProps) {
  const router = useRouter();
  const t = useTranslations("repoCard");
  const locale = useLocale();
  const fromNow = (date: string) => dayjs(date).locale(locale).fromNow();

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={t("openAria", { name: repo.fullName })}
      className="surface-card surface-card-hover h-full rounded-2xl cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500"
      onClick={() => router.push(`/repos/${repo.id}/test-cases`)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/repos/${repo.id}/test-cases`);
        }
      }}
    >
      <Card.Content className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Package size={20} className="text-indigo-500 shrink-0" />
            <span
              className="font-semibold text-sm truncate max-w-[140px] block"
              title={repo.fullName}
            >
              {repo.name}
            </span>
          </div>
          <Chip
            size="sm"
            variant="soft"
            color={repo.isPrivate ? undefined : "success"}
          >
            <Chip.Label className="flex items-center gap-1">
              {repo.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
              {repo.isPrivate ? t("private") : t("public")}
            </Chip.Label>
          </Chip>
        </div>

        <p className="text-xs text-muted mb-3 min-h-[36px] line-clamp-2">
          {repo.description || t("noDescription")}
        </p>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <GitBranch size={12} />
            <span>{repo.defaultBranch}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Clock size={12} />
            <span>
              {repo.lastSyncedAt
                ? t("syncedAgo", { time: fromNow(repo.lastSyncedAt) })
                : t("notSynced")}
            </span>
          </div>
        </div>

        {qaStats && qaStats.testCaseCount > 0 ? (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#3e3e42]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-emerald-500">{qaStats.testCaseCount - qaStats.failCount} ✓</span>
                {qaStats.failCount > 0 && <span className="text-red-500">{qaStats.failCount} ✗</span>}
              </div>
              <span className="text-muted">{qaStats.testCaseCount} cases</span>
            </div>
            <div className="h-1 rounded-full bg-gray-100 dark:bg-[#3e3e42] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.round(((qaStats.testCaseCount - qaStats.failCount) / qaStats.testCaseCount) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#3e3e42]">
            <span className="text-xs text-muted">No test cases</span>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
