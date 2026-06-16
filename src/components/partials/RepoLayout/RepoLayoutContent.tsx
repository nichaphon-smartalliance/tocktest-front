"use client";

import { Breadcrumbs, Chip } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, Globe } from "lucide-react";
import { BugPlay, GitCommitHorizontal, BookOpen, Settings, Terminal, MessageSquare } from "lucide-react";
import { useRepository } from "@/hooks/repository";
import { trackRecentRepo } from "@/hooks/common/useRecentRepos";
import { useEffect } from "react";

interface RepoLayoutContentProps {
  repoId: string;
  children: React.ReactNode;
}

const TAB_ITEMS = [
  { key: "test-cases", label: "Test Cases", icon: BugPlay },
  { key: "analysis", label: "Analysis", icon: GitCommitHorizontal },
  { key: "sandbox", label: "Sandbox", icon: Terminal },
  { key: "chat", label: "QA Chat", icon: MessageSquare },
  { key: "docs", label: "Docs", icon: BookOpen },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function RepoLayoutContent({ repoId, children }: RepoLayoutContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { repository, isLoading } = useRepository(repoId);

  useEffect(() => {
    if (repository?.fullName) trackRecentRepo(repoId, repository.fullName);
  }, [repoId, repository?.fullName]);

  const activeTab = TAB_ITEMS.find((t) => pathname.endsWith(t.key))?.key ?? "test-cases";

  return (
    <div>
      <Breadcrumbs className="mb-3">
        <Breadcrumbs.Item
          href="#"
          onClick={(e) => {
            e.preventDefault();
            router.push("/dashboard");
          }}
        >
          แดชบอร์ด
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          {isLoading ? (
            <span className="inline-block h-4 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <span className="flex items-center gap-1.5">
              {repository?.fullName}
              {repository && (
                <Chip
                  size="sm"
                  variant="soft"
                  color={repository.isPrivate ? undefined : "success"}
                >
                  <Chip.Label className="flex items-center gap-1 text-xs">
                    {repository.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                    {repository.isPrivate ? "Private" : "Public"}
                  </Chip.Label>
                </Chip>
              )}
            </span>
          )}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      <nav className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-0" aria-label="Repository sections">
        {TAB_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => router.push(`/repos/${repoId}/${key}`)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                active
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="pt-4">{children}</div>
    </div>
  );
}
