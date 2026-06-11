"use client";

import { Button, Dropdown, Avatar } from "@heroui/react";
import { PanelLeftClose, PanelLeftOpen, LogOut, Sun, Moon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/context/theme/ThemeProvider";
import type { ClientSession } from "@/types/app/session";

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  session: ClientSession;
}

export default function Header({ collapsed, onToggle, session }: HeaderProps) {
  const { mode, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-[var(--bg-sider)] px-4 dark:border-gray-700">
      <Button variant="ghost" isIconOnly onPress={onToggle} aria-label="Toggle sidebar" className="text-[var(--text-primary)]">
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" isIconOnly onPress={toggle} aria-label="Toggle theme" className="text-[var(--text-primary)]">
          {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Dropdown>
          <Dropdown.Trigger>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Avatar size="sm" color="accent">
                <Avatar.Fallback>{session.user.name?.charAt(0)?.toUpperCase() ?? "U"}</Avatar.Fallback>
              </Avatar>
              <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:inline">{session.user.name}</span>
            </button>
          </Dropdown.Trigger>
          <Dropdown.Popover placement="bottom end">
            <Dropdown.Menu
              onAction={(key) => {
                if (key === "logout") signOut({ callbackUrl: "/login" });
              }}
            >
              <Dropdown.Item id="logout" textValue="ออกจากระบบ">
                <LogOut size={14} />
                ออกจากระบบ
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </header>
  );
}
