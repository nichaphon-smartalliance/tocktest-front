"use client";

import { useState } from "react";
import { Layout } from "antd";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { Session } from "next-auth";
import { setupInterceptors } from "@/lib/api/interceptor";

setupInterceptors();

const { Content } = Layout;

interface AdminLayoutShellProps {
  children: React.ReactNode;
  session: Session;
}

export default function AdminLayoutShell({ children, session }: AdminLayoutShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} session={session} />
      <Layout>
        <Header
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          session={session}
        />
        <Content style={{ padding: 24, minHeight: "calc(100vh - 64px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
