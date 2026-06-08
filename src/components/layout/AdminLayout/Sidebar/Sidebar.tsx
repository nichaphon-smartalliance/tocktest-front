"use client";

import { Layout, Menu } from "antd";
import { LayoutDashboard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "next-auth";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  session: Session;
}

export default function Sidebar({ collapsed, session }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <LayoutDashboard size={16} />,
      label: "แดชบอร์ด",
    },
  ];

  const selectedKey = menuItems.find((item) => pathname.startsWith(item.key))?.key ?? "/dashboard";

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={220}
      style={{ height: "100vh", position: "sticky", top: 0, borderRight: "1px solid #e5e7eb" }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 20px",
          borderBottom: "1px solid #e5e7eb",
          cursor: "pointer",
        }}
        onClick={() => router.push("/dashboard")}
      >
        <span style={{ fontSize: 20 }}>🧪</span>
        {!collapsed && (
          <span style={{ marginLeft: 10, fontWeight: 700, fontSize: 16, color: "#6366f1" }}>
            TockTest
          </span>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{ border: "none", marginTop: 8 }}
        onClick={({ key }) => router.push(key)}
      />

      {/* User info at bottom */}
      {!collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{session.user.name}</div>
          <div>{session.user.email}</div>
        </div>
      )}
    </Sider>
  );
}
