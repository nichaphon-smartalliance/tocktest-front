"use client";

import { Button, Dropdown, Avatar, Chip } from "@heroui/react";
import { PanelLeftClose, PanelLeftOpen, LogOut, Sun, Moon, BotOff, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "@/context/theme/ThemeProvider";
import { BackButton } from "@/components/ui/BackButton";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { useAiHealth } from "@/hooks/ai/useAiHealth";
import type { ClientSession } from "@/types/app/session";

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  session: ClientSession;
}

export default function Header({ collapsed, onToggle, session }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggle } = useTheme();
  const { aiAvailable } = useAiHealth();
  const t = useTranslations("header");
  const tNav = useTranslations("nav");
  const showBack = pathname.startsWith("/repos/");

  return (
    <header className="shell-header sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-sider)] px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" isIconOnly onPress={onToggle} aria-label={t("toggleSidebar")} className="text-[var(--text-primary)]">
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </Button>
        {showBack && <BackButton fallbackHref="/dashboard" />}
      </div>

      <div className="flex items-center gap-2">
        {aiAvailable === false && (
          <span title={t("aiOfflineTooltip")}>
            <Chip color="warning" size="sm" variant="soft">
              <Chip.Label className="flex items-center gap-1">
                <BotOff size={12} />
                {t("aiOffline")}
              </Chip.Label>
            </Chip>
          </span>
        )}
        <LocaleSwitcher />
        <Button variant="ghost" isIconOnly onPress={toggle} aria-label={t("toggleTheme")} className="text-[var(--text-primary)]">
          {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Dropdown>
          <Dropdown.Trigger>
            <div className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 cursor-pointer hover:bg-white/10 dark:hover:bg-white/6">
              <Avatar size="sm" color="accent">
                <Avatar.Fallback>{session.user.name?.charAt(0)?.toUpperCase() ?? "U"}</Avatar.Fallback>
              </Avatar>
              <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:inline">{session.user.name}</span>
            </div>
          </Dropdown.Trigger>
          <Dropdown.Popover placement="bottom end">
            <Dropdown.Menu
              onAction={(key) => {
                if (key === "settings") router.push("/settings");
                if (key === "logout") signOut({ callbackUrl: "/login" });
              }}
            >
              <Dropdown.Item id="settings" textValue={tNav("settings")}>
                <Settings size={14} />
                {tNav("settings")}
              </Dropdown.Item>
              <Dropdown.Item id="logout" textValue={t("logout")}>
                <LogOut size={14} />
                {t("logout")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </header>
  );
}
