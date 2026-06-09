"use client";

import { Layout, Button, Dropdown, Avatar } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Sun, Moon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/context/theme/ThemeProvider";
import type { Session } from "next-auth";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  session: Session;
}

export default function Header({ collapsed, onToggle, session }: HeaderProps) {
  const { mode, toggle } = useTheme();

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ออกจากระบบ",
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <AntHeader
      style={{
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: 64,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{ fontSize: 16, width: 40, height: 40 }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Button
          type="text"
          icon={mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          onClick={toggle}
          style={{ width: 40, height: 40 }}
        />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: "#6366f1" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#ffffff" }}>{session.user.name}</span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
