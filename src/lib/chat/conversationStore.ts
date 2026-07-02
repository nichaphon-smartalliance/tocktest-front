import type { ChatMessage, Conversation } from "@/types/app/chat";

/**
 * Conversation persistence.
 *
 * The backend chat endpoint is stateless (it receives history per request), so
 * conversations are persisted client-side. All storage goes through the
 * {@link ConversationAdapter} interface — swap in a database-backed adapter later
 * via {@link setConversationAdapter} without touching the store or UI.
 */
export interface ConversationAdapter {
  load(repoId: string): Conversation[];
  save(repoId: string, conversations: Conversation[]): void;
  loadActiveId(repoId: string): string | null;
  saveActiveId(repoId: string, id: string | null): void;
}

const STORAGE_PREFIX = "tocktest_chat_conversations_";
const ACTIVE_PREFIX = "tocktest_chat_active_";
const TITLE_MAX = 60;

const localStorageAdapter: ConversationAdapter = {
  load(repoId) {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + repoId);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Conversation[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  save(repoId, conversations) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + repoId, JSON.stringify(conversations));
    } catch {
      /* quota / serialization failures are non-fatal — keep the in-memory state */
    }
  },
  loadActiveId(repoId) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACTIVE_PREFIX + repoId);
  },
  saveActiveId(repoId, id) {
    if (typeof window === "undefined") return;
    if (id) window.localStorage.setItem(ACTIVE_PREFIX + repoId, id);
    else window.localStorage.removeItem(ACTIVE_PREFIX + repoId);
  },
};

let adapter: ConversationAdapter = localStorageAdapter;

/** Replace the persistence backend (e.g. a REST/DB adapter) at app startup. */
export function setConversationAdapter(next: ConversationAdapter): void {
  adapter = next;
  cache.clear();
  emit();
}

// ── External store (React `useSyncExternalStore`) ──────────────────────────

interface RepoState {
  conversations: Conversation[]; // always kept sorted (pinned first, then recent)
  activeId: string | null;
}

const EMPTY: readonly Conversation[] = Object.freeze([]);
const cache = new Map<string, RepoState>();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "";
  const text = firstUser.content.replace(/\s+/g, " ").trim();
  return text.length > TITLE_MAX ? `${text.slice(0, TITLE_MAX)}…` : text;
}

function ensure(repoId: string): RepoState {
  let state = cache.get(repoId);
  if (!state) {
    const conversations = sortConversations(adapter.load(repoId));
    let activeId = adapter.loadActiveId(repoId);
    if (!activeId || !conversations.some((c) => c.id === activeId)) {
      activeId = conversations[0]?.id ?? null;
    }
    state = { conversations, activeId };
    cache.set(repoId, state);
  }
  return state;
}

function commit(repoId: string, conversations: Conversation[], activeId: string | null): void {
  const sorted = sortConversations(conversations);
  const nextActive = activeId && sorted.some((c) => c.id === activeId) ? activeId : sorted[0]?.id ?? null;
  cache.set(repoId, { conversations: sorted, activeId: nextActive });
  adapter.save(repoId, sorted);
  adapter.saveActiveId(repoId, nextActive);
  emit();
}

// ── Snapshots (stable references — required by useSyncExternalStore) ────────

export function getConversations(repoId: string): readonly Conversation[] {
  if (typeof window === "undefined") return EMPTY;
  return ensure(repoId).conversations;
}

export function getActiveId(repoId: string): string | null {
  if (typeof window === "undefined") return null;
  return ensure(repoId).activeId;
}

export function getServerConversations(): readonly Conversation[] {
  return EMPTY;
}

// ── Actions ─────────────────────────────────────────────────────────────────

function newConversationObject(repoId: string): Conversation {
  const now = Date.now();
  return { id: uid(), repoId, title: "", createdAt: now, updatedAt: now, messages: [] };
}

/**
 * Start a new conversation. If the current active conversation is still empty,
 * reuse it instead of stacking blank chats (matches ChatGPT/Claude behaviour).
 * Returns the id of the conversation to make active.
 */
export function createConversation(repoId: string): string {
  const state = ensure(repoId);
  const active = state.conversations.find((c) => c.id === state.activeId);
  if (active && active.messages.length === 0) return active.id;

  const conv = newConversationObject(repoId);
  // Drop any other empty (unsaved) conversations so history stays clean.
  const kept = state.conversations.filter((c) => c.messages.length > 0);
  commit(repoId, [conv, ...kept], conv.id);
  return conv.id;
}

export function selectConversation(repoId: string, id: string): void {
  const state = ensure(repoId);
  if (state.activeId === id) return;
  // Leaving an untouched empty chat discards it.
  const kept = state.conversations.filter((c) => c.messages.length > 0 || c.id === id);
  commit(repoId, kept, id);
}

export function renameConversation(repoId: string, id: string, title: string): void {
  const state = ensure(repoId);
  const next = state.conversations.map((c) => (c.id === id ? { ...c, title: title.trim() } : c));
  commit(repoId, next, state.activeId);
}

export function deleteConversation(repoId: string, id: string): void {
  const state = ensure(repoId);
  const next = state.conversations.filter((c) => c.id !== id);
  const activeId = state.activeId === id ? next[0]?.id ?? null : state.activeId;
  commit(repoId, next, activeId);
}

export function duplicateConversation(repoId: string, id: string): string | null {
  const state = ensure(repoId);
  const src = state.conversations.find((c) => c.id === id);
  if (!src) return null;
  const now = Date.now();
  const copy: Conversation = {
    ...src,
    id: uid(),
    title: src.title ? `${src.title} (copy)` : "",
    createdAt: now,
    updatedAt: now,
    pinned: false,
    messages: src.messages.map((m) => ({ ...m, id: uid() })),
  };
  commit(repoId, [copy, ...state.conversations], copy.id);
  return copy.id;
}

export function togglePin(repoId: string, id: string): void {
  const state = ensure(repoId);
  const next = state.conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
  commit(repoId, next, state.activeId);
}

/**
 * Update the active conversation's messages. Lazily creates a conversation if
 * none is active. Auto-titles from the first user message and bumps `updatedAt`
 * so the conversation floats to the top of the history list.
 */
export function setActiveMessages(
  repoId: string,
  updater: (prev: ChatMessage[]) => ChatMessage[],
): void {
  const state = ensure(repoId);
  let conversations = state.conversations;
  let activeId = state.activeId;

  if (!activeId || !conversations.some((c) => c.id === activeId)) {
    const conv = newConversationObject(repoId);
    conversations = [conv, ...conversations];
    activeId = conv.id;
  }

  const now = Date.now();
  const next = conversations.map((c) => {
    if (c.id !== activeId) return c;
    const messages = updater(c.messages);
    return { ...c, messages, title: c.title || deriveTitle(messages), updatedAt: now };
  });
  commit(repoId, next, activeId);
}

/**
 * Update a specific conversation's messages (does NOT change which conversation
 * is active). Used so an in-flight reply lands in the conversation it was sent
 * from, even if the user has since switched away.
 */
export function setConversationMessages(
  repoId: string,
  conversationId: string,
  updater: (prev: ChatMessage[]) => ChatMessage[],
): void {
  const state = ensure(repoId);
  if (!state.conversations.some((c) => c.id === conversationId)) return;
  const now = Date.now();
  const next = state.conversations.map((c) => {
    if (c.id !== conversationId) return c;
    const messages = updater(c.messages);
    return { ...c, messages, title: c.title || deriveTitle(messages), updatedAt: now };
  });
  commit(repoId, next, state.activeId);
}

export function clearActiveMessages(repoId: string): void {
  setActiveMessages(repoId, () => []);
}

// Cross-tab synchronisation: another tab wrote to storage → drop cache + notify.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key) return;
    let repoId: string | null = null;
    if (e.key.startsWith(STORAGE_PREFIX)) repoId = e.key.slice(STORAGE_PREFIX.length);
    else if (e.key.startsWith(ACTIVE_PREFIX)) repoId = e.key.slice(ACTIVE_PREFIX.length);
    if (repoId) {
      cache.delete(repoId);
      emit();
    }
  });
}
