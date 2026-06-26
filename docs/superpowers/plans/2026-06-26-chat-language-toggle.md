# Chat Language Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a TH/EN language toggle to the chat header so users can choose whether the AI chatbot responds in Thai or English, independent of the UI locale.

**Architecture:** Pass an explicit `language` field (`'th' | 'en'`) through the API. Backend uses it to replace the vague "same-language-as-user" instruction with an explicit directive in the system prompt. Frontend stores the preference in `localStorage`, renders a segmented toggle in the redesigned chat header, and feeds bilingual starters based on the selected language.

**Tech Stack:** NestJS (backend DTO + service), Next.js 15 App Router, HeroUI v3, next-intl, localStorage

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `tocktest-back/src/modules/chatbot/dto/chat.dto.ts` | Modify | Add `language` field |
| `tocktest-back/src/modules/chatbot/chatbot.service.ts` | Modify | Use `language` in system prompt |
| `tocktest-front/src/lib/api/api-main.ts` | Modify | Add `language` to API call type |
| `tocktest-front/messages/en.json` | Modify | Add toggle + header i18n keys |
| `tocktest-front/messages/th.json` | Modify | Add same keys in Thai |
| `tocktest-front/src/components/partials/Chat/ChatContent.tsx` | Modify | Redesign header + add toggle |

---

## Task 1: Backend DTO — add `language` field

**Files:**
- Modify: `tocktest-back/src/modules/chatbot/dto/chat.dto.ts`

- [ ] **Step 1: Add `language` to `ChatRequestDto`**

Replace the current content of `chat.dto.ts` with:

```typescript
import { IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  @MaxLength(8000)
  content: string;
}

export class ChatRequestDto {
  @IsString()
  @MaxLength(8000)
  message: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];

  @IsOptional()
  @IsString()
  @IsIn(['th', 'en'])
  language?: 'th' | 'en';
}
```

- [ ] **Step 2: Build backend to verify no type errors**

```bash
cd tocktest-back
npm run build
```

Expected: `Successfully compiled: X files with swc`

- [ ] **Step 3: Commit**

```bash
cd tocktest-back
git add src/modules/chatbot/dto/chat.dto.ts
git commit -m "feat(chatbot): add optional language field to ChatRequestDto"
```

---

## Task 2: Backend service — explicit language instruction

**Files:**
- Modify: `tocktest-back/src/modules/chatbot/chatbot.service.ts`

- [ ] **Step 1: Update system prompt to use `dto.language`**

Find this line in `chatbot.service.ts` (around line 36):

```typescript
Keep responses focused and practical. Respond in the same language as the user's message.`;
```

Replace with:

```typescript
Keep responses focused and practical. ${dto.language === 'en' ? 'Respond in English only.' : 'Respond in Thai (ภาษาไทย) only.'}`;
```

Full updated `chat` method system prompt section (lines 26–37):

```typescript
const systemPrompt = `You are a QA assistant for the repository "${repo.fullName}".
You help with test planning, test case design, and quality assurance questions.

Repository context:
${context}

Answer questions accurately and helpfully. If asked to write test code, produce Cypress TypeScript by default.
Keep responses focused and practical. ${dto.language === 'en' ? 'Respond in English only.' : 'Respond in Thai (ภาษาไทย) only.'}`;
```

- [ ] **Step 2: Build to verify**

```bash
cd tocktest-back
npm run build
```

Expected: `Successfully compiled: X files with swc`

- [ ] **Step 3: Commit**

```bash
cd tocktest-back
git add src/modules/chatbot/chatbot.service.ts
git commit -m "feat(chatbot): use explicit language directive in system prompt"
```

---

## Task 3: Frontend API type — add `language` param

**Files:**
- Modify: `tocktest-front/src/lib/api/api-main.ts`

- [ ] **Step 1: Update `chatWithRepoApi` body type**

Find this in `api-main.ts` (around line 187):

```typescript
export const chatWithRepoApi = (
  repoId: string,
  body: { message: string; history?: { role: 'user' | 'assistant'; content: string }[] },
) => mainClient.post<ApiResponse<{ response: string; repoId: string }>>(`/repositories/${repoId}/chat`, body, { timeout: 60_000 });
```

Replace with:

```typescript
export const chatWithRepoApi = (
  repoId: string,
  body: { message: string; history?: { role: 'user' | 'assistant'; content: string }[]; language?: 'th' | 'en' },
) => mainClient.post<ApiResponse<{ response: string; repoId: string }>>(`/repositories/${repoId}/chat`, body, { timeout: 60_000 });
```

- [ ] **Step 2: Type-check frontend**

```bash
cd tocktest-front
npm run type-check
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd tocktest-front
git add src/lib/api/api-main.ts
git commit -m "feat(api): add language param to chatWithRepoApi"
```

---

## Task 4: i18n — add toggle and header keys

**Files:**
- Modify: `tocktest-front/messages/en.json`
- Modify: `tocktest-front/messages/th.json`

- [ ] **Step 1: Add keys to `messages/en.json`**

Inside the `"chat"` object, add these keys after `"error"`:

```json
"langToggleLabel": "Reply language",
"headerSub": "Test planning, code review, QA strategy",
"starter1En": "What areas should I test first in this repo?",
"starter2En": "Generate a Cypress test for the login flow",
"starter3En": "What are the highest-risk recent changes?",
"starter4En": "Suggest test cases for the most recent commits",
"starter1Th": "ควรทดสอบส่วนไหนก่อนใน repo นี้?",
"starter2Th": "สร้าง Cypress test สำหรับ login flow",
"starter3Th": "การเปลี่ยนแปลงล่าสุดที่เสี่ยงสุดคืออะไร?",
"starter4Th": "แนะนำ test case สำหรับ commit ล่าสุด"
```

- [ ] **Step 2: Add keys to `messages/th.json`**

Inside the `"chat"` object, add these keys after `"error"`:

```json
"langToggleLabel": "ภาษาที่ตอบ",
"headerSub": "วางแผนการทดสอบ, code review และกลยุทธ์ QA",
"starter1En": "What areas should I test first in this repo?",
"starter2En": "Generate a Cypress test for the login flow",
"starter3En": "What are the highest-risk recent changes?",
"starter4En": "Suggest test cases for the most recent commits",
"starter1Th": "ควรทดสอบส่วนไหนก่อนใน repo นี้?",
"starter2Th": "สร้าง Cypress test สำหรับ login flow",
"starter3Th": "การเปลี่ยนแปลงล่าสุดที่เสี่ยงสุดคืออะไร?",
"starter4Th": "แนะนำ test case สำหรับ commit ล่าสุด"
```

- [ ] **Step 3: Commit**

```bash
cd tocktest-front
git add messages/en.json messages/th.json
git commit -m "feat(i18n): add chat language toggle keys to en and th"
```

---

## Task 5: ChatContent — redesign header + language toggle

**Files:**
- Modify: `tocktest-front/src/components/partials/Chat/ChatContent.tsx`

- [ ] **Step 1: Replace entire file with redesigned version**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Card } from "@heroui/react";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { chatWithRepoApi } from "@/lib/api/api-main";
import { getApiErrorMessage } from "@/lib/api-error";
import ReactMarkdown from "react-markdown";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";

type ChatLang = "th" | "en";

interface Message {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

interface ChatContentProps {
  repoId: string;
  repoName?: string;
}

const LANG_KEY = "tocktest_chat_lang";

function getInitialLang(appLocale: string): ChatLang {
  if (typeof window === "undefined") return appLocale === "en" ? "en" : "th";
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === "th" || stored === "en") return stored;
  return appLocale === "en" ? "en" : "th";
}

export default function ChatContent({ repoId, repoName }: ChatContentProps) {
  const t = useTranslations("chat");
  const appLocale = useLocale() as Locale;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLang, setChatLang] = useState<ChatLang>(() => getInitialLang(appLocale));
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLangChange = (lang: ChatLang) => {
    setChatLang(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const res = await chatWithRepoApi(repoId, { message: content, history, language: chatLang });
      const reply = res.data?.data?.response ?? "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: getApiErrorMessage(err, t("error")),
          error: true,
        },
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const starters =
    chatLang === "en"
      ? [t("starter1En"), t("starter2En"), t("starter3En"), t("starter4En")]
      : [t("starter1Th"), t("starter2Th"), t("starter3Th"), t("starter4Th")];

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <Card className="rounded-xl flex flex-col" style={{ minHeight: "600px" }}>

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-[#3e3e42] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-[var(--text-primary)]">{t("title")}</span>
                {repoName && (
                  <span className="inline-flex items-center rounded-md bg-indigo-500/10 dark:bg-indigo-500/15 px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    {repoName}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-tight mt-0.5">{t("headerSub")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language toggle pill */}
            <div
              role="group"
              aria-label={t("langToggleLabel")}
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

            {/* Clear button — only when there are messages */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                title={t("clearTitle")}
                className="h-8 w-8 rounded-lg border border-gray-200 dark:border-[#3e3e42] flex items-center justify-center text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-[#2a2d2e] transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Messages ──────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
          style={{ minHeight: 0, maxHeight: "calc(100vh - 280px)" }}
        >
          {messages.length === 0 && (
            <div className="flex flex-col gap-3 my-auto py-8">
              <div className="flex justify-center mb-2">
                <Bot size={40} className="text-indigo-400" />
              </div>
              <p className="text-sm text-center text-muted">{t("emptyHint")}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-2">
                {starters.map((s) => (
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

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
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

        {/* ── Input ─────────────────────────────────────────── */}
        <div className="border-t border-gray-200 dark:border-[#3e3e42] p-3 flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
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
```

- [ ] **Step 2: Type-check frontend**

```bash
cd tocktest-front
npm run type-check
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd tocktest-front
git add src/components/partials/Chat/ChatContent.tsx
git commit -m "feat(chat): redesign header with TH/EN language toggle and bilingual starters"
```

---

## Self-Review

**Spec coverage:**
- ✅ Language toggle in chat header — Task 5
- ✅ TH/EN selection — Task 5 (pill toggle)
- ✅ Backend uses explicit language — Tasks 1 + 2
- ✅ API type updated — Task 3
- ✅ i18n keys added — Task 4
- ✅ Bilingual starters — Task 5
- ✅ localStorage persistence — Task 5 (`LANG_KEY`)
- ✅ Clear button moved to header — Task 5
- ✅ Textarea auto-resize — Task 5 (`handleTextareaChange`)
- ✅ Repo name badge in header — Task 5

**Placeholder scan:** None found. All steps have full code.

**Type consistency:**
- `ChatLang = "th" | "en"` — defined in Task 5, used consistently
- `getInitialLang` — defined and called in same file
- `chatWithRepoApi` body type updated in Task 3, used in Task 5
- `t("starter1En")` etc. — keys added in Task 4, used in Task 5
- `t("headerSub")` — key added in Task 4, used in Task 5
- `t("langToggleLabel")` — key added in Task 4, used in Task 5
