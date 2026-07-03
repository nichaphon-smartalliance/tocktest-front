"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useConversations } from "@/hooks/chat/useConversations";
import { useRepository } from "@/hooks/repository";
import ChatHistorySidebar from "./ChatHistorySidebar";
import ChatContent from "./ChatContent";

interface ChatWorkspaceProps {
  repoId: string;
}

export default function ChatWorkspace({ repoId }: ChatWorkspaceProps) {
  const t = useTranslations("chatHistory");
  const locale = useLocale();
  const { repository } = useRepository(repoId);
  const {
    conversations,
    activeId,
    activeConversation,
    newConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    setMessagesFor,
    clearActive,
  } = useConversations(repoId);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);
  const [pendingPrompt, setPendingPrompt] = useState<{ text: string; nonce: number } | null>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const handleNew = () => {
    newConversation();
    setFocusSignal((n) => n + 1);
  };

  // A sidebar suggestion starts a fresh chat and auto-sends the question.
  const handleSuggestion = (text: string) => {
    newConversation();
    setPendingPrompt({ text, nonce: Date.now() });
  };

  const clearPending = useCallback(() => setPendingPrompt(null), []);

  const sidebar = (afterNavigate?: () => void) => (
    <ChatHistorySidebar
      conversations={conversations}
      activeId={activeId}
      locale={locale}
      onNew={handleNew}
      onSelect={selectConversation}
      onRename={renameConversation}
      onDelete={deleteConversation}
      onSuggestion={handleSuggestion}
      afterNavigate={afterNavigate}
    />
  );

  return (
    <div className="flex h-[calc(100vh-13rem)] min-h-[520px] gap-4">
      {/* Desktop / tablet: persistent sidebar */}
      <aside className="hidden w-[280px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-[var(--bg-panel)] lg:flex dark:border-[#3e3e42]">
        {sidebar()}
      </aside>

      {/* Chat pane */}
      <div className="min-w-0 flex-1">
        <ChatContent
          repoId={repoId}
          repoName={repository?.name}
          messages={activeConversation?.messages ?? []}
          conversationId={activeId}
          setMessagesFor={setMessagesFor}
          ensureConversation={newConversation}
          onClear={clearActive}
          onOpenHistory={() => setDrawerOpen(true)}
          focusSignal={focusSignal}
          pendingPrompt={pendingPrompt}
          onPromptConsumed={clearPending}
        />
      </div>

      {/* Mobile: slide-out drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          role="dialog"
          aria-label={t("history")}
          className={`absolute left-0 top-0 flex h-full w-[300px] max-w-[85%] flex-col bg-[var(--bg-sider)] shadow-xl transition-transform duration-200 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar(() => setDrawerOpen(false))}
        </aside>
      </div>
    </div>
  );
}
