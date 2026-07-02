"use client";

import { Breadcrumbs, Chip } from "@heroui/react";
import { BookOpen, BugPlay, GitCommitHorizontal, MessageSquare, Settings, Globe, Lock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { trackRecentRepo } from "@/hooks/common/useRecentRepos";
import { useRepository } from "@/hooks/repository";

interface RepoLayoutContentProps {
  repoId: string;
  children: React.ReactNode;
}

const TAB_ITEMS = [
  { key: "test-cases", labelKey: "testCases", icon: BugPlay },
  { key: "chat", labelKey: "chat", icon: MessageSquare },
  { key: "docs", labelKey: "docs", icon: BookOpen },
] as const;

export default function RepoLayoutContent({ repoId, children }: RepoLayoutContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { repository, isLoading } = useRepository(repoId);
  const tTabs = useTranslations("repoTabs");
  const tNav = useTranslations("nav");

  useEffect(() => {
    if (repository?.fullName) trackRecentRepo(repoId, repository.fullName);
  }, [repoId, repository?.fullName]);

  const activeTab = TAB_ITEMS.find((item) => pathname.endsWith(item.key))?.key ?? "test-cases";

  return (
    <div>
      <Breadcrumbs className="mb-3">
        <Breadcrumbs.Item
          href="#"
          onClick={(event) => {
            event.preventDefault();
            router.push("/dashboard");
          }}
        >
          {tNav("dashboard")}
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          {isLoading ? (
            <span className="inline-block h-4 w-28 rounded bg-gray-200 dark:bg-[#3c3c3c] animate-pulse" />
          ) : (
            <span className="flex items-center gap-1.5">
              {repository?.fullName}
              {repository && (
                <Chip size="sm" variant="soft" color={repository.isPrivate ? undefined : "success"}>
                  <Chip.Label className="flex items-center gap-1 text-xs">
                    {repository.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                    {repository.isPrivate ? tTabs("private") : tTabs("public")}
                  </Chip.Label>
                </Chip>
              )}
            </span>
          )}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      <nav className="flex gap-1 border-b border-gray-200 dark:border-[#3e3e42] mb-0" aria-label="Repository sections">
        {TAB_ITEMS.map(({ key, labelKey, icon: Icon }) => {
          const active = activeTab === key;

          return (
            <button
              key={key}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => router.push(`/repos/${repoId}/${key}`)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px cursor-pointer ${
                active
                  ? "border-indigo-500 text-indigo-600 dark:border-[#4fc1ff] dark:text-[#4fc1ff]"
                  : "border-transparent text-muted hover:text-[var(--text-primary)] hover:border-gray-300 dark:hover:border-[#3e3e42]"
              }`}
            >
              <Icon size={14} />
              {tTabs(labelKey)}
            </button>
          );
        })}
      </nav>

      <div className="pt-4">{children}</div>
    </div>
  );
}
