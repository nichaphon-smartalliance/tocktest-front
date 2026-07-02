export type ChatRole = "user" | "assistant";

/** A single chat message. `id` + `timestamp` are required for persistence and stable rendering. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  error?: boolean;
}

/** A persisted conversation, scoped to a single repository. */
export interface Conversation {
  id: string;
  repoId: string;
  /** Empty string means "not yet titled" — the UI falls back to a localized "New chat". */
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
}
