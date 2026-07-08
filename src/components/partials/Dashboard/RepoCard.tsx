"use client";

import { Card, Chip } from "@heroui/react";
import { Lock, Globe, Package, GitBranch, Clock, CheckCircle2, AlertTriangle, Ban, CircleDashed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import type { Repository } from "@/types/app/repository";

dayjs.extend(relativeTime);

interface RepoCardProps {
  repo: Repository;
  qaStats?: {
    testCaseCount: number;
    passCount: number;
    failCount: number;
    blockedCount: number;
    notTestedCount: number;
  };
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
          <div className="flex items-start gap-2 min-w-0">
            <Package size={20} className="text-indigo-500 shrink-0" />
            <span
              className="font-semibold text-sm break-words min-w-0"
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

        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
          {qaStats && qaStats.testCaseCount > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                <span className="text-muted">{t("statusPass")}</span>
                <span className="ml-auto font-semibold tabular-nums">{qaStats.passCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <AlertTriangle size={11} className="text-red-500 shrink-0" />
                <span className="text-muted">{t("statusFail")}</span>
                <span className="ml-auto font-semibold tabular-nums">{qaStats.failCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Ban size={11} className="text-amber-500 shrink-0" />
                <span className="text-muted">{t("statusBlocked")}</span>
                <span className="ml-auto font-semibold tabular-nums">{qaStats.blockedCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <CircleDashed size={11} className="text-gray-400 shrink-0" />
                <span className="text-muted">{t("statusWaiting")}</span>
                <span className="ml-auto font-semibold tabular-nums">{qaStats.notTestedCount}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted">{t("noTestCases")}</span>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
