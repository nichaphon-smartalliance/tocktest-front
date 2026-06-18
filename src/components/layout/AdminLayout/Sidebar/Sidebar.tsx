"use client";

import { Chip } from "@heroui/react";
import {
  Bot,
  BotOff,
  ChevronRight,
  Github,
  LayoutDashboard,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAiHealth } from "@/hooks/ai/useAiHealth";
import { useRecentRepos } from "@/hooks/common/useRecentRepos";
import { useQaSummary } from "@/hooks/dashboard";
import type { QaRecentRepoResponse } from "@/types/api/main/dashboard";
import type { ClientSession } from "@/types/app/session";

const EXPANDED_W = 260;
const COLLAPSED_W = 64;

const MAIN_NAV = [
  { key: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
] as const;

function SectionLabel({ children, collapsed }: { children: string; collapsed: boolean }) {
  if (collapsed) return null;

  return (
    <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
      {children}
    </p>
  );
}


function RecentRepoList({
  summary,
  recentLocal,
  collapsed,
  activeRepoId,
}: {
  summary: { recentRepos?: QaRecentRepoResponse[] } | null | undefined;
  recentLocal: { id: string; fullName: string }[];
  collapsed: boolean;
  activeRepoId?: string;
}) {
  const router = useRouter();
  const t = useTranslations("sidebar");
  const [expanded, setExpanded] = useState(false);
  console.log("expanded", expanded);
  if (collapsed) return null;

  const fromApi = summary?.recentRepos ?? [];
  const merged = [...recentLocal];
  for (const repo of fromApi) {
    if (!merged.some((item) => item.id === repo.id)) merged.push({ id: repo.id, fullName: repo.fullName });
  }
  const limit = 5;
  const display = expanded ? merged : merged.slice(0, limit);
  if (display.length === 0) return null;

  const statsMap = new Map(fromApi.map((repo) => [repo.id, repo]));

  return (
    <>
      <SectionLabel collapsed={collapsed}>{t("recentRepos")}</SectionLabel>
      <div className="px-2 flex flex-col gap-0.5 mb-2">
        {display.map((repo) => {
          const stats = statsMap.get(repo.id);
          const active = repo.id === activeRepoId;
          const shortName = repo.fullName.split("/").pop() ?? repo.fullName;

          return (
            <button
              key={repo.id}
              type="button"
              title={repo.fullName}
              onClick={() => router.push(`/repos/${repo.id}/test-cases`)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer w-full ${
                active
                  ? "bg-indigo-500/10 dark:bg-[#37373d] text-indigo-600 dark:text-[#4fc1ff]"
                  : "text-gray-600 hover:bg-gray-100 dark:text-[#cccccc] dark:hover:bg-[#2a2d2e]"
              }`}
            >
              <Github size={13} className="shrink-0 opacity-60" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{shortName}</div>
                {stats && stats.testCaseCount > 0 && (
                  <div className="text-xs text-muted mt-0.5">
                    {t("cases", { count: stats.testCaseCount })}
                    {stats.failCount > 0 && (
                      <span className="text-red-500 ml-1">· {t("fail", { count: stats.failCount })}</span>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight size={12} className="shrink-0 opacity-40" />
            </button>
          );
        })}
        {merged.length > limit && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-xs text-indigo-600 dark:text-[#007acc] px-2.5 py-1 hover:underline cursor-pointer text-left"
          >
            {expanded ? t("viewLess"):t("viewAll")} 
          </button>
        )}
      </div>
    </>
  );
}

interface SidebarProps {
  collapsed: boolean;
  session: ClientSession;
}

export default function Sidebar({ collapsed, session }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { summary } = useQaSummary();
  const { recent } = useRecentRepos();
  const { aiAvailable } = useAiHealth();
  const t = useTranslations("sidebar");
  const tNav = useTranslations("nav");

  const repoMatch = pathname.match(/^\/repos\/([^/]+)/);
  const activeRepoId = repoMatch?.[1];

  const selectedKey =
    MAIN_NAV.find((item) => pathname === item.key || pathname.startsWith(`${item.key}/`))?.key ??
    (pathname.startsWith("/repos/") ? undefined : "/dashboard");

  const failCount = summary?.byStatus.fail ?? 0;

  return (
    <aside
      className="shell-sidebar sticky top-0 flex h-screen flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sider)] transition-[width] duration-200 overflow-hidden"
      style={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
    >
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="flex h-16 shrink-0 items-center border-b border-white/10 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 dark:from-[#007acc] dark:via-[#007acc] dark:to-[#007acc] px-4 cursor-pointer"
        style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? 0 : undefined }}
      >
        {collapsed ? (
          <span className="text-lg font-bold text-white tracking-tight">T</span>
        ) : (
          <div className="text-left">
            <span className="text-base font-bold text-white tracking-tight block">TockTest</span>
            <span className="text-xs text-indigo-100/80">{t("aiQaPlatform")}</span>
          </div>
        )}
      </button>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <SectionLabel collapsed={collapsed}>{t("main")}</SectionLabel>
        <nav className="flex flex-col gap-1 px-2 pb-1.5">
          {MAIN_NAV.map(({ key, icon: Icon, labelKey }) => {
            const active = selectedKey === key;
            const label = tNav(labelKey);

            return (
              <button
                key={key}
                type="button"
                onClick={() => router.push(key)}
                title={collapsed ? label : undefined}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                  active
                  ? "bg-indigo-500/14 dark:bg-[#37373d] font-semibold text-indigo-600 shadow-sm dark:text-[#4fc1ff] dark:shadow-none"
                  : "text-gray-600 hover:bg-white/40 dark:text-[#cccccc] dark:hover:bg-[#2a2d2e]"
                }`}
                style={{ justifyContent: collapsed ? "center" : "flex-start" }}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
                {collapsed && key === "/dashboard" && failCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </nav>

        <RecentRepoList summary={summary} recentLocal={recent} collapsed={collapsed} activeRepoId={activeRepoId} />
      </div>

        <div className="shrink-0 border-t border-[var(--border-subtle)] px-3 py-3">
        {!collapsed && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Chip size="sm" variant="soft" color={aiAvailable === true ? "success" : aiAvailable === false ? "warning" : "accent"}>
              <Chip.Label className="text-xs flex items-center gap-1">
                {aiAvailable === false ? <BotOff size={10} /> : <Bot size={10} />}
                {aiAvailable === true ? t("aiOnline") : aiAvailable === false ? t("aiOffline") : t("aiUnknown")}
              </Chip.Label>
            </Chip>
            <Chip size="sm" variant="soft" color={summary?.hasGithubToken ? "success" : "danger"}>
              <Chip.Label className="text-xs flex items-center gap-1">
                <Github size={10} />
                {summary?.hasGithubToken ? t("githubOk") : t("githubNoToken")}
              </Chip.Label>
            </Chip>
          </div>
        )}

        {!collapsed ? (
          <div className="text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-[var(--text-primary)] truncate">{session.user.name}</div>
                <div className="truncate text-xs">{session.user.email}</div>
              </div>
            </div>
            {session.user.role === "admin" && (
              <Chip size="sm" variant="soft" color="accent" className="mt-2">
                <Chip.Label className="text-xs">{t("admin")}</Chip.Label>
              </Chip>
            )}
          </div>
        ) : (
          <div
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold text-sm"
            title={session.user.name}
          >
            {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
        )}
      </div>
    </aside>
  );
}
