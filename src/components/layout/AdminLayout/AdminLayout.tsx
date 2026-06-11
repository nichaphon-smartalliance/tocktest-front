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
    <div className="flex min-h-screen bg-[var(--bg-layout)]">
      <Sidebar collapsed={collapsed} session={session} />
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        <Header
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          session={session}
        />
        <main className="flex-1 p-4 md:p-6 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}
