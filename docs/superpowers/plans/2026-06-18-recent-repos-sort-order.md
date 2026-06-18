# Recent Repos Sort Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix "REPOS ล่าสุด" sidebar to show repos ordered by most recently updated (when you last fixed/edited them) instead of most recently visited.

**Architecture:** Flip the merge order in `RecentRepoList` inside `Sidebar.tsx` so the backend's `updatedAt DESC` list (`fromApi`) is the base, and localStorage visit entries fill in any gaps. No backend or API changes needed — the backend already returns repos in the correct order.

**Tech Stack:** Next.js 14, TypeScript, localStorage for local tracking, TanStack Query for API data

---

### Task 1: Fix merge order in RecentRepoList

**Files:**
- Modify: `src/components/layout/AdminLayout/Sidebar/Sidebar.tsx:55-59`

- [ ] **Step 1: Open the file and locate the merge block**

File: `src/components/layout/AdminLayout/Sidebar/Sidebar.tsx`

Find this block (around line 55):

```ts
const fromApi = summary?.recentRepos ?? [];
const merged = [...recentLocal];
for (const repo of fromApi) {
  if (!merged.some((item) => item.id === repo.id)) merged.push({ id: repo.id, fullName: repo.fullName });
}
```

- [ ] **Step 2: Replace with API-first merge**

Replace the block above with:

```ts
const fromApi = summary?.recentRepos ?? [];
const merged: { id: string; fullName: string }[] = [...fromApi];
for (const repo of recentLocal) {
  if (!merged.some((item) => item.id === repo.id)) merged.push({ id: repo.id, fullName: repo.fullName });
}
```

The only change: `merged` starts from `fromApi` (backend, `updatedAt DESC`) instead of `recentLocal` (localStorage, visit order). Local-only repos are appended at the end.

- [ ] **Step 3: Verify TypeScript compiles**

Run from `C:\Users\Rattanbaan_N\Desktop\tock\tocktest-front`:

```bash
npx tsc --noEmit
```

Expected: no errors (the type of `merged` is now explicit, which is fine since `QaRecentRepoResponse` has `id` and `fullName`).

- [ ] **Step 4: Verify in browser**

Start dev server:
```bash
npm run dev
```

Open the app, navigate to a repo you updated a while ago and one you updated recently. The recently-updated one should appear higher in "REPOS ล่าสุด" regardless of which you navigated to last.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/AdminLayout/Sidebar/Sidebar.tsx
git commit -m "fix: sort REPOS ล่าสุด by most recently updated instead of visited"
```
