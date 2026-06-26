# Reliable EN/TH Chat Answers — Implementation Plan

**Goal:** When the user picks EN in the chat header, the AI answers in English (and TH → Thai) reliably, in both the online-AI path and the offline heuristic fallback.

**Root cause:**
1. The language directive sits in the *middle* of the system prompt, after a large Thai context block (test cases, commits, docs). LLMs mirror the dominant context language and ignore the buried instruction.
2. `heuristicChat` (offline fallback) ignores language entirely and is hard-coded English.

**Approach:**
- A. Strengthen the AI prompt: move the language directive to the END of the system prompt, make it emphatic, and prefix the user's message with a bracketed directive (recency + proximity = high compliance). Thread `language` into `aiService.chat`.
- B. Make `heuristicChat` language-aware (TH/EN) so the offline path also honors the toggle.

---

## Task 1: chatbot.service.ts — strong directive + thread language

**File:** `tocktest-back/src/modules/chatbot/chatbot.service.ts`

- Build `langDirective` and `userPrefix` from `dto.language`.
- End the system prompt with `langDirective`.
- Prefix the final user turn with `userPrefix`.
- Pass `language` to `aiService.chat`.

## Task 2: ai.service.ts — accept language, pass to heuristic

**File:** `tocktest-back/src/modules/ai/ai.service.ts`

- Add `language?: 'th' | 'en'` to `AiExecutionOptions`.
- In `chat()`, call `heuristicChat(messages, options?.language ?? 'th')`.

## Task 3: heuristic-ai.ts — bilingual heuristicChat

**File:** `tocktest-back/src/common/utils/heuristic-ai.ts`

- `heuristicChat(messages, lang: 'th' | 'en' = 'th')`.
- Provide TH/EN variants of every framing string (echoed repo data stays as stored).

## Task 4: Verify

- `npm run build` (backend) clean.
- Restart backend, click EN → English reply; TH → Thai reply.
