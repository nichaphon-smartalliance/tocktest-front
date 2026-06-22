"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tock:recent-repos";
const MAX = 5;

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

export function useRecentRepos() {
  const [recent, setRecent] = useState<RecentRepoEntry[]>([]);

  useEffect(() => {
    setRecent(readStorage());
  }, []);

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
  } catch {}
}
