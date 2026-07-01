# Dark Mode Contrast Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the two verified dark-mode contrast/consistency defects found in `tocktest-front`, and align them with the app's existing custom dark palette.

**Architecture:** No structural change. `tocktest-front` already has a mature dark-mode system: a `data-theme="dark"` attribute toggled by `src/context/theme/ThemeProvider.tsx`, wired into Tailwind 4 via `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` in `src/app/globals.css:3`, plus a full custom hex palette (`#1e1e1e`, `#252526`, `#2d2d2d`, `#3e3e42`, `#cccccc`, `#858585`, `#007acc`, `#4fc1ff`) used consistently across `Sidebar.tsx`, `ChatContent.tsx`, `DocsContent.tsx`, `TestCaseModal.tsx`, and `LoginContent.tsx`. Two components deviate from that palette by falling back to bare Tailwind grays with no (or incomplete) `dark:` override — this plan brings them in line.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS 4 (`@custom-variant`), TypeScript 5.

---

## Investigation summary (what was checked and ruled out)

A full-codebase pass (agent scan + manual verification of every flagged line) found the dark-mode implementation is **already solid**: the CSS variable system in `globals.css` (`--bg-layout`, `--bg-panel`, `--text-primary`, `--text-muted`, `--border-subtle`, etc.) is applied broadly, `Sidebar.tsx`, `ChatContent.tsx`, `LoginContent.tsx`, and most of `AdminSettingsContent.tsx`/`DocsContent.tsx` already carry correct `dark:` variants. Several items an automated scan flagged as "critical" (e.g. `Sidebar.tsx:73`, `ChatContent.tsx:223`, `TestCases.config.ts:10`, `FolderTree.tsx:57`) were manually re-checked against the actual file content and are **not bugs** — they already have matching `dark:` classes and were false positives. Only two real, verifiable defects remain, both are icon/glyph contrast issues where `dark:` coverage is missing or inconsistent with the rest of the app's palette.

**Separately found, out of scope for this plan:** `src/components/partials/Docs/DocsContent.tsx:236-249` contains a broken/dead UI block — bare `Switch.Control`/`Switch.Content` rendered without a parent `<Switch>` wrapper, no label, no `isSelected`/`onChange` binding — and the two handlers `handleToggleAutoSync` / `handleToggleOffline` (same file, lines 140-156) are defined but never called. This is a functional bug, not a dark-mode/theme issue, so it is **not** included as a task here — flagged to the user separately.

---

### Task 1: Fix password-toggle eye-icon contrast in Admin Settings

**Files:**
- Modify: `src/components/partials/AdminSettings/AdminSettingsContent.tsx:342`
- Modify: `src/components/partials/AdminSettings/AdminSettingsContent.tsx:359`
- Modify: `src/components/partials/AdminSettings/AdminSettingsContent.tsx:374`

**Problem:** All three password-field "show/hide" icon buttons (Current Password, New Password, Confirm Password) use:

```tsx
className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
```

`text-gray-400` (`#9ca3af`) has no explicit `dark:text-*` for its resting (non-hover) state, and the hover state uses bare Tailwind `dark:hover:text-gray-300` instead of the app's established dark palette (`#858585` resting / `#cccccc` hover), which is the pattern already used for icon buttons elsewhere, e.g. `src/components/partials/Chat/ChatContent.tsx:160`:

```tsx
className={`... text-gray-500 dark:text-[#858585] hover:text-gray-700 dark:hover:text-[#cccccc] ...`}
```

- [ ] **Step 1: Confirm current (pre-fix) class strings**

Run: `grep -n "hover:text-gray-300" "src/components/partials/AdminSettings/AdminSettingsContent.tsx"`
Expected: 3 matches, at lines 342, 359, 374.

- [ ] **Step 2: Replace all three occurrences**

For each of the 3 buttons, change:

```tsx
className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
```

to:

```tsx
className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[#858585] dark:hover:text-[#cccccc]"
```

- [ ] **Step 3: Verify no remaining bare-gray dark hover on these buttons**

Run: `grep -n "hover:text-gray-300" "src/components/partials/AdminSettings/AdminSettingsContent.tsx"`
Expected: no matches.

- [ ] **Step 4: Type-check**

Run (from `tocktest-front/`): `npm run type-check`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/partials/AdminSettings/AdminSettingsContent.tsx
git commit -m "fix: align password-toggle icon contrast with dark palette"
```

---

### Task 2: Fix tag-remove button contrast in Test Case tag input

**Files:**
- Modify: `src/components/partials/TestCases/Modal/TestCaseModal.tsx:52`

**Problem:** The tag-chip remove ("×") button inside `TagInput` has **no dark-mode override at all**:

```tsx
className="cursor-pointer text-gray-400 text-xs leading-none"
```

The tag chip itself is properly themed (`bg-gray-100 dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#3e3e42]`, same file, line 45), but the small "×" glyph inside it stays `#9ca3af` in both modes — on the dark chip background (`#2d2d2d`) this is a small glyph well under AA contrast expectations, and doesn't get lighter/more visible like every other icon in the app does in dark mode.

- [ ] **Step 1: Confirm current (pre-fix) class string**

Run: `grep -n "cursor-pointer text-gray-400 text-xs leading-none" "src/components/partials/TestCases/Modal/TestCaseModal.tsx"`
Expected: 1 match at line 52.

- [ ] **Step 2: Replace the class string**

Change:

```tsx
className="cursor-pointer text-gray-400 text-xs leading-none"
```

to:

```tsx
className="cursor-pointer text-gray-400 hover:text-gray-600 dark:text-[#858585] dark:hover:text-[#cccccc] text-xs leading-none"
```

- [ ] **Step 3: Type-check**

Run (from `tocktest-front/`): `npm run type-check`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/partials/TestCases/Modal/TestCaseModal.tsx
git commit -m "fix: add dark-mode contrast to tag-remove button"
```

---

## Self-review

- **Spec coverage:** Both verified defects from the investigation summary have a task. The DocsContent dead-switch bug is explicitly excluded (out of scope: not a theme issue) and flagged separately, not silently dropped.
- **Placeholder scan:** No TBD/"add appropriate X" placeholders — every step shows exact before/after code and exact commands.
- **Type consistency:** N/A — no new functions, types, or shared signatures introduced; both tasks are isolated `className` string edits with no cross-task dependency.
