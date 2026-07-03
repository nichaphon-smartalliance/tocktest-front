"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search, MessageSquarePlus } from "lucide-react";
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 p-2.5 pb-2">
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
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
            className="w-full rounded-lg border border-gray-200 bg-transparent py-1.5 pl-8 pr-2.5 text-[13px] outline-none transition-shadow focus:ring-2 focus:ring-indigo-500/40 dark:border-[#3e3e42] dark:bg-[#1e1e1e]"
          />
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <MessageSquarePlus size={40} className="text-indigo-400/70" aria-hidden />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{t("emptyTitle")}</p>
            <p className="mt-1 text-xs text-muted">{t("emptyHint")}</p>
          </div>
          <button
            type="button"
            onClick={handleNew}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-[#3e3e42] dark:text-[#4fc1ff] dark:hover:bg-[#2a2d2e]"
          >
            <Plus size={14} />
            {t("newChat")}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-xs text-muted">{t("noResults")}</p>
        </div>
      ) : (
        <>
          <p className="px-4 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted/80">
            {t("history")}
          </p>
          <ul
            className="flex flex-1 flex-col gap-px overflow-y-auto px-1.5 pb-2"
            aria-label={t("history")}
          >
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
  );
}
