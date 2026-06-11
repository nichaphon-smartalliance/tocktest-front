"use client";

import { Tabs, Breadcrumbs, Chip } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, Globe } from "lucide-react";
import { BugPlay, GitCommitHorizontal, BookOpen, Settings } from "lucide-react";
import { useRepository } from "@/hooks/repository";

interface RepoLayoutContentProps {
  repoId: string;
  children: React.ReactNode;
}

const TAB_ITEMS = [
  { key: "test-cases", label: "Test Cases", icon: BugPlay },
  { key: "analysis", label: "Analysis", icon: GitCommitHorizontal },
  { key: "docs", label: "Docs", icon: BookOpen },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function RepoLayoutContent({ repoId, children }: RepoLayoutContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { repository, isLoading } = useRepository(repoId);

  const activeTab = TAB_ITEMS.find((t) => pathname.endsWith(t.key))?.key ?? "test-cases";

  const onTabChange = (key: string | number) => {
    router.push(`/repos/${repoId}/${key}`);
  };

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
                  <Chip.Label className="flex items-center gap-1 text-[11px]">
                    {repository.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                    {repository.isPrivate ? "Private" : "Public"}
                  </Chip.Label>
                </Chip>
              )}
            </span>
          )}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      <Tabs selectedKey={activeTab} onSelectionChange={onTabChange}>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Repository sections">
            {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
              <Tabs.Tab key={key} id={key}>
                <span className="flex items-center gap-1.5">
                  <Icon size={14} />
                  {label}
                </span>
              </Tabs.Tab>
            ))}
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <div className="pt-4">{children}</div>
    </div>
  );
}
