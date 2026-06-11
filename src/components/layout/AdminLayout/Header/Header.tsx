"use client";

import { Button, Dropdown, Avatar, Chip } from "@heroui/react";
import { PanelLeftClose, PanelLeftOpen, LogOut, Sun, Moon, BotOff } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/context/theme/ThemeProvider";
import { useAiHealth } from "@/hooks/ai/useAiHealth";
import type { ClientSession } from "@/types/app/session";

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  session: ClientSession;
}

export default function Header({ collapsed, onToggle, session }: HeaderProps) {
  const { mode, toggle } = useTheme();
  const { aiAvailable } = useAiHealth();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-[var(--bg-sider)] px-4 dark:border-gray-700">
      <Button variant="ghost" isIconOnly onPress={onToggle} aria-label="Toggle sidebar" className="text-[var(--text-primary)]">
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </Button>

      <div className="flex items-center gap-2">
        {!aiAvailable && (
          <span title="AI server ไม่พร้อมใช้งาน — ฟีเจอร์ AI จะใช้ไม่ได้ชั่วคราว">
            <Chip color="warning" size="sm" variant="soft">
              <Chip.Label className="flex items-center gap-1">
                <BotOff size={12} />
                AI offline
              </Chip.Label>
            </Chip>
          </span>
        )}
        <Button variant="ghost" isIconOnly onPress={toggle} aria-label="Toggle theme" className="text-[var(--text-primary)]">
          {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Dropdown>
          <Dropdown.Trigger>
            <div className="flex items-center gap-2 rounded-lg px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
              <Avatar size="sm" color="accent">
                <Avatar.Fallback>{session.user.name?.charAt(0)?.toUpperCase() ?? "U"}</Avatar.Fallback>
              </Avatar>
              <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:inline">{session.user.name}</span>
            </div>
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
