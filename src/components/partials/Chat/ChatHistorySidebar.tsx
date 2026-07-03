"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search, Bot } from "lucide-react";
import type { Conversation } from "@/types/app/chat";
import ConversationItem from "./ConversationItem";

interface ChatHistorySidebarProps {
  conversations: readonly Conversation[];
  activeId: string | null;
  locale: string;
  onNew: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  /** Called after selecting/creating so a mobile drawer can close itself. */
  afterNavigate?: () => void;
}

export default function ChatHistorySidebar({
  conversations,
  activeId,
  locale,
  onNew,
  onSelect,
  onRename,
  onDelete,
  afterNavigate,
}: ChatHistorySidebarProps) {
  const t = useTranslations("chatHistory");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [conversations, query]);

  const handleNew = () => {
    onNew();
    afterNavigate?.();
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    afterNavigate?.();
  };

  const sectionLabel =
    "px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[var(--text-muted)]";

  return (
    <div className="flex h-full flex-col">
      {/* ── Fixed header: new chat + search ── */}
      <div className="flex flex-col gap-2.5 p-4 pb-3">
        <button
          type="button"
          onClick={handleNew}
          aria-label={t("newChatAria")}
          style={{ color: "#ffffff" }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-indigo-500 active:bg-indigo-700 cursor-pointer dark:bg-[#0e639c] dark:hover:bg-[#1177bb]"
        >
          <Plus size={16} style={{ color: "#ffffff" }} />
          <span style={{ color: "#ffffff" }}>{t("newChat")}</span>
        </button>

        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
            className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-transparent pl-9 pr-3 text-sm outline-none transition-shadow focus:border-[#6D5DFC] focus:ring-2 focus:ring-[#6D5DFC]/25 dark:border-[#3e3e42] dark:bg-[#1e1e1e]"
          />
        </div>
      </div>

      {/* ── Scrollable chat list ── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F6F4FF] dark:bg-[#2a2d2e]">
              <Bot size={24} className="text-[#6D5DFC] dark:text-[#4fc1ff]" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{t("emptyTitle")}</p>
              <p className="mt-1 text-xs text-muted">{t("emptyHint")}</p>
            </div>
            <button
              type="button"
              onClick={handleNew}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-[#ECE9FF] px-3 py-1.5 text-xs font-medium text-[#6D5DFC] transition-colors hover:bg-[#F6F4FF] dark:border-[#3e3e42] dark:text-[#4fc1ff] dark:hover:bg-[#2a2d2e]"
            >
              <Plus size={14} />
              {t("newChat")}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-xs text-muted">{t("noResults")}</p>
          </div>
        ) : (
          <>
            <p className={`${sectionLabel} pt-2`}>{t("history")}</p>
            <ul className="flex flex-col gap-1.5" aria-label={t("history")}>
              {filtered.map((c) => (
                <li key={c.id}>
                  <ConversationItem
                    conversation={c}
                    active={c.id === activeId}
                    locale={locale}
                    onSelect={() => handleSelect(c.id)}
                    onRename={(title) => onRename(c.id, title)}
                    onDelete={() => onDelete(c.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
