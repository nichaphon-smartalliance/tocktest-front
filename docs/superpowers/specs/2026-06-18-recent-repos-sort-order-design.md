# Recent Repos Sort Order — Design

**Date:** 2026-06-18  
**Status:** Approved

## Problem

The "REPOS ล่าสุด" sidebar list currently orders repos by **visit time** (localStorage `visitedAt`), with API repos appended after. This means a repo you visited a week ago appears before one you just updated today.

## Goal

Show repos in the order the user **most recently worked on them** — i.e., most recently updated first.

## Solution: API-first merge (Option A)

**File:** `src/components/layout/AdminLayout/Sidebar/Sidebar.tsx` — `RecentRepoList` component (lines ~55-59)

The backend already returns `recentRepos` ordered by `updatedAt DESC`. The fix flips the merge order:

- **Before:** `merged = [...recentLocal, ...apiNotInLocal]` — visit order first
- **After:** `merged = [...fromApi, ...localNotInApi]` — updatedAt order first

### Trade-offs accepted
- If you're actively viewing a repo that isn't in the API's top list, it appears at the bottom rather than the top. Acceptable — the API list already captures recently active repos.
- No backend changes needed.
- No new API calls.

## Scope

Single change: swap the merge order in `RecentRepoList`. No other files touched.
