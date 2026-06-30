"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { ClientSession } from "@/types/app/session";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  session: ClientSession;
}

export default function AdminLayoutShell({ children, session }: AdminLayoutShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on small screens for usable content width
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setCollapsed(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-[var(--bg-layout)]">
      <Sidebar collapsed={collapsed} session={session} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          session={session}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
