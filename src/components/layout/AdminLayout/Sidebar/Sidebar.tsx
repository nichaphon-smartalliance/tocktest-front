"use client";

import {
  LayoutDashboard,
  Settings,
  Github,
  Bot,
  BotOff,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Ban,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Chip, Spinner } from "@heroui/react";
import type { ClientSession } from "@/types/app/session";
import type { QaSummaryResponse } from "@/types/api/main/dashboard";
import { useQaSummary } from "@/hooks/dashboard";
import { useRecentRepos } from "@/hooks/common/useRecentRepos";
import { useAiHealth } from "@/hooks/ai/useAiHealth";

const EXPANDED_W = 260;
const COLLAPSED_W = 64;

const MAIN_NAV = [
  { key: "/dashboard", icon: LayoutDashboard, label: "แดชบอร์ด" },
  { key: "/settings", icon: Settings, label: "การตั้งค่า" },
] as const;


function SectionLabel({ children, collapsed }: { children: string; collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
      {children}
    </p>
  );
}

function QaSnapshot({ summary, collapsed }: { summary: QaSummaryResponse | null | undefined; collapsed: boolean }) {
  if (collapsed || !summary) return null;

  const { byStatus, totalTestCases, passRate, failHighPriority, aiGeneratedCount } = summary;
  if (totalTestCases === 0) {
    return (
      <div className="mx-2 mb-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-3 py-2.5">
        <p className="text-xs text-muted m-0">ยังไม่มี test case</p>
        <p className="text-[10px] text-muted mt-0.5 m-0">ซิงค์ repo แล้วเริ่มสร้าง test case</p>
      </div>
    );
  }

  const items = [
    { key: "pass", label: "ผ่าน", value: byStatus.pass, icon: CheckCircle2, color: "text-emerald-600" },
    { key: "fail", label: "ไม่ผ่าน", value: byStatus.fail, icon: AlertTriangle, color: "text-red-500" },
    { key: "blocked", label: "ติดขัด", value: byStatus.blocked, icon: Ban, color: "text-amber-500" },
    { key: "not_tested", label: "รอทดสอบ", value: byStatus.not_tested, icon: CircleDashed, color: "text-gray-400" },
  ];

  return (
    <div className="mx-2 mb-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold">ภาพรวม QA</span>
        <span className="text-[10px] text-muted">{totalTestCases} cases</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map(({ key, label, value, icon: Icon, color }) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <Icon size={12} className={color} />
            <span className="text-muted">{label}</span>
            <span className="ml-auto font-semibold tabular-nums">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-1.5">
        <Chip size="sm" variant="soft" color={passRate >= 70 ? "success" : passRate >= 40 ? "warning" : "danger"}>
          <Chip.Label className="text-[10px]">Pass rate {passRate}%</Chip.Label>
        </Chip>
        {failHighPriority > 0 && (
          <Chip size="sm" variant="soft" color="danger">
            <Chip.Label className="text-[10px]">{failHighPriority} fail สำคัญ</Chip.Label>
          </Chip>
        )}
        {aiGeneratedCount > 0 && (
          <Chip size="sm" variant="soft" color="accent">
            <Chip.Label className="text-[10px] flex items-center gap-0.5">
              <Sparkles size={9} />
              AI {aiGeneratedCount}
            </Chip.Label>
          </Chip>
        )}
      </div>
    </div>
  );
}

function RecentRepoList({
  summary,
  recentLocal,
  collapsed,
  activeRepoId,
}: {
  summary: QaSummaryResponse | null | undefined;
  recentLocal: { id: string; fullName: string }[];
  collapsed: boolean;
  activeRepoId?: string;
}) {
  const router = useRouter();
  if (collapsed) return null;

  const fromApi = summary?.recentRepos ?? [];
  const merged = [...recentLocal];
  for (const r of fromApi) {
    if (!merged.some((m) => m.id === r.id)) merged.push({ id: r.id, fullName: r.fullName });
  }
  const display = merged.slice(0, 5);
  if (display.length === 0) return null;

  const statsMap = new Map(fromApi.map((r) => [r.id, r]));

  return (
    <>
      <SectionLabel collapsed={collapsed}>Repos ล่าสุด</SectionLabel>
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
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <Github size={13} className="shrink-0 opacity-60" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{shortName}</div>
                {stats && stats.testCaseCount > 0 && (
                  <div className="text-[10px] text-muted mt-0.5">
                    {stats.testCaseCount} cases
                    {stats.failCount > 0 && (
                      <span className="text-red-500 ml-1">· {stats.failCount} fail</span>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight size={12} className="shrink-0 opacity-40" />
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-[10px] text-indigo-600 dark:text-indigo-400 px-2.5 py-1 hover:underline cursor-pointer text-left"
        >
          ดูทั้งหมด →
        </button>
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
  const { summary, isLoading } = useQaSummary();
  const { recent } = useRecentRepos();
  const { aiAvailable } = useAiHealth();

  const repoMatch = pathname.match(/^\/repos\/([^/]+)/);
  const activeRepoId = repoMatch?.[1];

  const selectedKey =
    MAIN_NAV.find((item) => pathname === item.key || pathname.startsWith(`${item.key}/`))?.key ??
    (pathname.startsWith("/repos/") ? undefined : "/dashboard");

  const failCount = summary?.byStatus.fail ?? 0;

  return (
    <aside
      className="sticky top-0 flex h-screen flex-col border-r border-gray-200 bg-[var(--bg-sider)] transition-[width] duration-200 dark:border-gray-700 overflow-hidden"
      style={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
    >
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="flex h-16 shrink-0 items-center border-b border-white/10 bg-indigo-500 px-4 cursor-pointer"
        style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? 0 : undefined }}
      >
        {collapsed ? (
          <span className="text-lg font-bold text-white tracking-tight">T</span>
        ) : (
          <div className="text-left">
            <span className="text-base font-bold text-white tracking-tight block">TockTest</span>
            <span className="text-[10px] text-indigo-100/80">AI QA Platform</span>
          </div>
        )}
      </button>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <SectionLabel collapsed={collapsed}>หลัก</SectionLabel>
        <nav className="flex flex-col gap-0.5 px-2 pb-1">
          {MAIN_NAV.map(({ key, icon: Icon, label }) => {
            const active = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => router.push(key)}
                title={collapsed ? label : undefined}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                  active
                    ? "bg-indigo-500/10 font-semibold text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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

        {isLoading && !collapsed ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : (
          <QaSnapshot summary={summary} collapsed={collapsed} />
        )}

        <RecentRepoList
          summary={summary}
          recentLocal={recent}
          collapsed={collapsed}
          activeRepoId={activeRepoId}
        />
      </div>

      <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-3 py-3">
        {!collapsed && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Chip size="sm" variant="soft" color={aiAvailable === true ? "success" : aiAvailable === false ? "warning" : "accent"}>
              <Chip.Label className="text-[10px] flex items-center gap-1">
                {aiAvailable === false ? <BotOff size={10} /> : <Bot size={10} />}
                AI {aiAvailable === true ? "online" : aiAvailable === false ? "offline" : "..."}
              </Chip.Label>
            </Chip>
            <Chip size="sm" variant="soft" color={summary?.hasGithubToken ? "success" : "danger"}>
              <Chip.Label className="text-[10px] flex items-center gap-1">
                <Github size={10} />
                GitHub {summary?.hasGithubToken ? "OK" : "ไม่มี token"}
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
                <div className="truncate text-[10px]">{session.user.email}</div>
              </div>
            </div>
            {session.user.role === "admin" && (
              <Chip size="sm" variant="soft" color="accent" className="mt-2">
                <Chip.Label className="text-[10px]">Admin</Chip.Label>
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
