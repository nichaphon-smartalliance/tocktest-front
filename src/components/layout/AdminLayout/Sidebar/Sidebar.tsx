"use client";

import { LayoutDashboard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "next-auth";

interface SidebarProps {
  collapsed: boolean;
  session: Session;
}

const NAV_ITEMS = [
  { key: "/dashboard", icon: LayoutDashboard, label: "แดชบอร์ด" },
];

export default function Sidebar({ collapsed, session }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const selectedKey = NAV_ITEMS.find((item) => pathname.startsWith(item.key))?.key ?? "/dashboard";

  return (
    <aside
      className="sticky top-0 flex h-screen flex-col border-r border-gray-200 bg-[var(--bg-sider)] transition-[width] duration-200 dark:border-gray-700"
      style={{ width: collapsed ? 64 : 220 }}
    >
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="flex h-16 shrink-0 items-center border-b border-white/10 bg-indigo-500 px-5 cursor-pointer"
        style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? 0 : undefined }}
      >
        {collapsed ? (
          <span className="text-lg font-bold text-white tracking-tight">T</span>
        ) : (
          <span className="text-base font-bold text-white tracking-tight">TockTest</span>
        )}
      </button>

      <nav className="mt-2 flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
          const active = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => router.push(key)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                active
                  ? "bg-indigo-500/10 font-semibold text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-auto px-4 pb-4 text-xs opacity-60">
          <div className="font-semibold mb-0.5">{session.user.name}</div>
          <div>{session.user.email}</div>
        </div>
      )}
    </aside>
  );
}
