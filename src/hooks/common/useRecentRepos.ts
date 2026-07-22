"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "tock:recent-repos";
const MAX = 20;
const UPDATE_EVENT = "tock:recent-repos-updated";

export interface RecentRepoEntry {
  id: string;
  fullName: string;
  visitedAt: number;
}

function readStorage(): RecentRepoEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentRepoEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const EMPTY: RecentRepoEntry[] = [];

// useSyncExternalStore requires getSnapshot to return a STABLE reference when
// the underlying data is unchanged, or it re-renders forever. Cache the parsed
// value keyed by the raw storage string so equal reads return the same array.
let cachedRaw: string | null = null;
let cachedValue: RecentRepoEntry[] = EMPTY;

function getSnapshot(): RecentRepoEntry[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = readStorage();
  return cachedValue;
}

function getServerSnapshot(): RecentRepoEntry[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(UPDATE_EVENT, onChange);
  // Also react to writes from other tabs.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(UPDATE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useRecentRepos() {
  const recent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { recent };
}

/** Call from repo layout when repository is loaded */
export function trackRecentRepo(id: string, fullName: string) {
  try {
    const prev = readStorage();
    const next = [{ id, fullName, visitedAt: Date.now() }, ...prev.filter((r) => r.id !== id)].slice(
      0,
      MAX,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {}
}
