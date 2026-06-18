"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Card, Spinner, Alert } from "@heroui/react";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { chatWithRepoApi } from "@/lib/api/api-main";
import { getApiErrorMessage } from "@/lib/api-error";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

interface ChatContentProps {
  repoId: string;
  repoName?: string;
}

const STARTERS = [
  "What areas should I test first in this repo?",
  "Generate a Cypress test for the login flow",
  "What are the highest-risk recent changes?",
  "Suggest test cases for the most recent commits",
];

export default function ChatContent({ repoId, repoName }: ChatContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const res = await chatWithRepoApi(repoId, { message: content, history });
      const reply = res.data?.data?.response ?? "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: getApiErrorMessage(err, "Failed to get AI response. Make sure AI service is running."), error: true },
      ]);
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

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">QA Chatbot</h1>
        <p className="text-sm text-muted mt-0.5">
          Ask questions about {repoName ?? "this repo"} — test planning, code review, and QA strategy.
        </p>
      </div>

      <Card className="rounded-xl flex flex-col" style={{ minHeight: "600px" }}>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ minHeight: 0, maxHeight: "calc(100vh - 280px)" }}>
          {messages.length === 0 && (
            <div className="flex flex-col gap-3 my-auto py-8">
              <div className="flex justify-center mb-2">
                <Bot size={40} className="text-indigo-400" />
              </div>
              <p className="text-sm text-center text-muted">
                I know your test cases, recent commits, and project docs. Ask me anything.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="text-left rounded-lg border border-gray-200 dark:border-slate-600/60 px-3 py-2 text-xs text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/6 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white ${msg.role === "user" ? "bg-indigo-500" : "bg-gray-600 dark:bg-slate-500"}`}>
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm break-words ${
                  msg.role === "user"
                    ? "max-w-[80%] bg-indigo-500 text-white rounded-tr-sm"
                    : msg.error
                    ? "max-w-[92%] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-sm"
                    : "max-w-[92%] bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-tl-sm"
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
              <div className="shrink-0 h-7 w-7 rounded-full bg-gray-600 dark:bg-slate-500 flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 p-3 flex gap-2 items-end">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="shrink-0 h-9 w-9 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-muted hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
              title="Clear conversation"
            >
              <RefreshCw size={14} />
            </button>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about testing, code quality, or test case ideas... (Enter to send)"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-white/15 bg-transparent dark:bg-white/4 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-shadow"
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
