"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ChatMessage } from "@/types/app/chat";
import * as store from "@/lib/chat/conversationStore";

/**
 * Reactive access to a repository's conversations, backed by the persistent
 * conversation store. Efficient by design: components only re-render when the
 * store's snapshot reference changes.
 */
export function useConversations(repoId: string) {
  const conversations = useSyncExternalStore(
    store.subscribe,
    () => store.getConversations(repoId),
    store.getServerConversations,
  );
  const activeId = useSyncExternalStore(
    store.subscribe,
    () => store.getActiveId(repoId),
    () => null,
  );

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const newConversation = useCallback(() => store.createConversation(repoId), [repoId]);
  const selectConversation = useCallback(
    (id: string) => store.selectConversation(repoId, id),
    [repoId],
  );
  const renameConversation = useCallback(
    (id: string, title: string) => store.renameConversation(repoId, id, title),
    [repoId],
  );
  const deleteConversation = useCallback(
    (id: string) => store.deleteConversation(repoId, id),
    [repoId],
  );
  const duplicateConversation = useCallback(
    (id: string) => store.duplicateConversation(repoId, id),
    [repoId],
  );
  const togglePin = useCallback((id: string) => store.togglePin(repoId, id), [repoId]);
  const setActiveMessages = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[]) => store.setActiveMessages(repoId, updater),
    [repoId],
  );
  const setMessagesFor = useCallback(
    (id: string, updater: (prev: ChatMessage[]) => ChatMessage[]) =>
      store.setConversationMessages(repoId, id, updater),
    [repoId],
  );
  const clearActive = useCallback(() => store.clearActiveMessages(repoId), [repoId]);

  return {
    conversations,
    activeId,
    activeConversation,
    newConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    duplicateConversation,
    togglePin,
    setActiveMessages,
    setMessagesFor,
    clearActive,
  };
}
