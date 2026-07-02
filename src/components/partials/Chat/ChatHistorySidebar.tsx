"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@heroui/react";
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
  onDuplicate: (id: string) => void;
  onTogglePin: (id: string) => void;
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
  onDuplicate,
  onTogglePin,
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
      <div className="flex flex-col gap-3 p-3">
        <Button
          variant="primary"
          fullWidth
          onPress={handleNew}
          aria-label={t("newChatAria")}
          className="rounded-xl"
        >
          <Plus size={16} />
          {t("newChat")}
        </Button>

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
            className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500/40 dark:border-[#3e3e42] dark:bg-[#1e1e1e]"
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
        <ul
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-3"
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
                onDuplicate={() => onDuplicate(c.id)}
                onTogglePin={() => onTogglePin(c.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
