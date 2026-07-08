"use client";

import { Button, Dropdown, Avatar, Chip } from "@heroui/react";
import { PanelLeftClose, PanelLeftOpen, LogOut, Sun, Moon, Bot, BotOff, Github, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/theme/ThemeProvider";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { useAiHealth } from "@/hooks/ai/useAiHealth";
import { useQaSummary } from "@/hooks/dashboard";
import type { ClientSession } from "@/types/app/session";

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  session: ClientSession;
}

export default function Header({ collapsed, onToggle, session }: HeaderProps) {
  const router = useRouter();
  const { mode, toggle } = useTheme();
  const { aiAvailable } = useAiHealth();
  const { summary } = useQaSummary();
  const t = useTranslations("header");
  const tNav = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    setAvatarSrc(localStorage.getItem(`avatar_${session.user.id}`));

    const handleAvatarUpdate = (e: Event) => {
      setAvatarSrc((e as CustomEvent<{ src: string | null }>).detail.src);
    };
    window.addEventListener("avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("avatar-updated", handleAvatarUpdate);
  }, [session.user.id]);

  return (
    <header className="shell-header sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-sider)] px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" isIconOnly onPress={onToggle} aria-label={t("toggleSidebar")} className="text-[var(--text-primary)]">
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Chip size="sm" variant="soft" color={aiAvailable === true ? "success" : aiAvailable === false ? "warning" : "accent"}>
          <Chip.Label className="text-xs flex items-center gap-1">
            {aiAvailable === false ? <BotOff size={12} /> : <Bot size={12} />}
            {aiAvailable === true ? tSidebar("aiOnline") : aiAvailable === false ? tSidebar("aiOffline") : tSidebar("aiUnknown")}
          </Chip.Label>
        </Chip>
        <Chip size="sm" variant="soft" color={summary?.hasGithubToken ? "success" : "danger"}>
          <Chip.Label className="text-xs flex items-center gap-1">
            <Github size={12} />
            {summary?.hasGithubToken ? tSidebar("githubOk") : tSidebar("githubNoToken")}
          </Chip.Label>
        </Chip>
        <LocaleSwitcher />
        <Button variant="ghost" isIconOnly onPress={toggle} aria-label={t("toggleTheme")} className="text-[var(--text-primary)]">
          {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Dropdown>
          <Dropdown.Trigger>
            <div className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 cursor-pointer hover:bg-white/10 dark:hover:bg-[#2a2d2e]">
              {avatarSrc ? (
                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-[var(--border-subtle)]">
                  <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" />
                </div>
              ) : (
                <Avatar size="sm" color="accent">
                  <Avatar.Fallback>{session.user.name?.charAt(0)?.toUpperCase() ?? "U"}</Avatar.Fallback>
                </Avatar>
              )}
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
