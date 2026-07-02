"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Card } from "@heroui/react";
import { Send, Bot, User, RefreshCw, PanelLeft } from "lucide-react";
import { chatWithRepoApi } from "@/lib/api/api-main";
import { getApiErrorMessage } from "@/lib/api-error";
import ReactMarkdown from "react-markdown";
import type { ChatMessage, ChatRole } from "@/types/app/chat";

type ChatLang = "th" | "en";

interface ChatContentProps {
  repoId: string;
  repoName?: string;
  messages: ChatMessage[];
  conversationId: string | null;
  /** Append/replace messages in a specific conversation (survives switching). */
  setMessagesFor: (conversationId: string, updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  /** Lazily create (or reuse) a conversation, returning its id. */
  ensureConversation: () => string;
  onClear?: () => void;
  onOpenHistory?: () => void;
  /** Bumped by the workspace to move focus into the input (e.g. on "New chat"). */
  focusSignal?: number;
}

const LANG_KEY = "tocktest_chat_lang";

const TEXTS = {
  th: {
    title: "QA Chatbot",
    headerSub: "วางแผนการทดสอบ, code review และกลยุทธ์ QA",
    emptyHint: "ฉันรู้จัก test case, commit ล่าสุด และ docs ของโปรเจกต์คุณ ถามอะไรก็ได้",
    starters: [
      "ควรทดสอบส่วนไหนก่อนใน repo นี้?",
      "สร้าง Cypress test สำหรับ login flow",
      "การเปลี่ยนแปลงล่าสุดที่เสี่ยงสุดคืออะไร?",
      "แนะนำ test case สำหรับ commit ล่าสุด",
    ],
    clearTitle: "ล้างบทสนทนา",
    openHistory: "ประวัติแชท",
    inputPlaceholder: "ถามเกี่ยวกับการทดสอบ, คุณภาพโค้ด หรือไอเดีย test case... (กด Enter เพื่อส่ง)",
    langLabel: "ภาษาที่ตอบ",
    error: "ไม่ได้รับคำตอบจาก AI ตรวจสอบว่า AI service กำลังทำงานอยู่",
  },
  en: {
    title: "QA Chatbot",
    headerSub: "Test planning, code review, QA strategy",
    emptyHint: "I know your test cases, recent commits, and project docs. Ask me anything.",
    starters: [
      "What areas should I test first in this repo?",
      "Generate a Cypress test for the login flow",
      "What are the highest-risk recent changes?",
      "Suggest test cases for the most recent commits",
    ],
    clearTitle: "Clear conversation",
    openHistory: "Chat history",
    inputPlaceholder: "Ask about testing, code quality, or test case ideas... (Enter to send)",
    langLabel: "Reply language",
    error: "Failed to get AI response. Make sure AI service is running.",
  },
} as const;

function getInitialLang(): ChatLang {
  if (typeof window === "undefined") return "th";
  const stored = localStorage.getItem(LANG_KEY);
  return stored === "en" ? "en" : "th";
}

function makeMessage(role: ChatRole, content: string, error?: boolean): ChatMessage {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return { id, role, content, timestamp: Date.now(), ...(error ? { error: true } : {}) };
}

export default function ChatContent({
  repoId,
  repoName,
  messages,
  conversationId,
  setMessagesFor,
  ensureConversation,
  onClear,
  onOpenHistory,
  focusSignal,
}: ChatContentProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLang, setChatLang] = useState<ChatLang>(getInitialLang);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = TEXTS[chatLang];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [focusSignal]);

  // Switching conversations: clear the draft and reset the input without remounting.
  useEffect(() => {
    setInput("");
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.focus();
    }
  }, [conversationId]);

  const handleLangChange = (lang: ChatLang) => {
    setChatLang(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const targetId = conversationId ?? ensureConversation();
    const userMsg = makeMessage("user", content);
    setMessagesFor(targetId, (prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const res = await chatWithRepoApi(repoId, { message: content, history, language: chatLang });
      const reply = res.data?.data?.response ?? "";
      setMessagesFor(targetId, (prev) => [...prev, makeMessage("assistant", reply)]);
    } catch (err) {
      setMessagesFor(targetId, (prev) => [...prev, makeMessage("assistant", getApiErrorMessage(err, t.error), true)]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <Card className="flex h-full flex-col rounded-xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-[#3e3e42] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                aria-label={t.openHistory}
                className="lg:hidden h-8 w-8 shrink-0 rounded-lg border border-gray-200 dark:border-[#3e3e42] flex items-center justify-center text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-[#2a2d2e] transition-colors"
              >
                <PanelLeft size={15} />
              </button>
            )}
            <div className="shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-[var(--text-primary)]">{t.title}</span>
                {repoName && (
                  <span className="inline-flex items-center rounded-md bg-indigo-500/10 dark:bg-indigo-500/15 px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    {repoName}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-tight mt-0.5">{t.headerSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* TH / EN pill toggle */}
            <div
              role="group"
              aria-label={t.langLabel}
              className="flex rounded-lg bg-gray-100 dark:bg-[#2d2d2d] p-0.5 gap-0.5"
            >
              {(["th", "en"] as ChatLang[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLangChange(lang)}
                  aria-pressed={chatLang === lang}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    chatLang === lang
                      ? "bg-white dark:bg-[#3c3c3c] text-indigo-600 dark:text-[#4fc1ff] shadow-sm"
                      : "text-gray-500 dark:text-[#858585] hover:text-gray-700 dark:hover:text-[#cccccc]"
                  }`}
                >
                  {lang === "th" ? "TH" : "EN"}
                </button>
              ))}
            </div>

            {/* Clear — only when messages exist */}
            {messages.length > 0 && onClear && (
              <button
                type="button"
                onClick={onClear}
                title={t.clearTitle}
                aria-label={t.clearTitle}
                className="h-8 w-8 rounded-lg border border-gray-200 dark:border-[#3e3e42] flex items-center justify-center text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-[#2a2d2e] transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex flex-col gap-3 my-auto py-8">
              <div className="flex justify-center mb-2">
                <Bot size={40} className="text-indigo-400" />
              </div>
              <p className="text-sm text-center text-muted">{t.emptyHint}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-2">
                {t.starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="text-left rounded-lg border border-gray-200 dark:border-[#3e3e42] px-3 py-2 text-xs text-gray-600 dark:text-[#cccccc] hover:bg-gray-50 dark:hover:bg-[#2a2d2e] transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white ${
                  msg.role === "user" ? "bg-indigo-500" : "bg-gray-600 dark:bg-[#5a5a5a]"
                }`}
              >
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm break-words ${
                  msg.role === "user"
                    ? "max-w-[80%] bg-indigo-500 text-white rounded-tr-sm"
                    : msg.error
                    ? "max-w-[92%] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-sm"
                    : "max-w-[92%] bg-gray-100 dark:bg-[#2d2d2d] text-gray-900 dark:text-[#d4d4d4] rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none break-words [&_:not(pre)>code]:whitespace-pre-wrap [&_:not(pre)>code]:break-words [&>pre]:overflow-x-auto [&>pre]:text-xs">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="shrink-0 h-7 w-7 rounded-full bg-gray-600 dark:bg-[#5a5a5a] flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-[#2d2d2d] px-4 py-2.5 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-[#858585] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-[#858585] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-[#858585] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div className="border-t border-gray-200 dark:border-[#3e3e42] p-3 flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-[#3e3e42] bg-transparent dark:bg-[#3c3c3c] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#007acc] transition-shadow"
            style={{ minHeight: "38px", maxHeight: "120px", overflowY: "auto" }}
          />
          <Button
            variant="primary"
            isDisabled={loading || !input.trim()}
            onPress={() => void send()}
            isIconOnly
            className="h-9 w-9 shrink-0 rounded-xl"
          >
            <Send size={15} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
