"use client";

import { useState, useEffect } from "react";

const EXPIRE_DAYS = parseInt(process.env.NEXT_PUBLIC_SEARCH_PERSIST_EXPIRE_NUM || "7") || 7;

export function useSearchPersist<T extends Record<string, string>>(
  key: string,
  defaultValues: T
) {
  const [filterValues, setFilterValues] = useState<T>(defaultValues);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sp:${key}`);
      if (!saved) return;
      const { values, expiry } = JSON.parse(saved) as { values: T; expiry: number };
      if (Date.now() < expiry) setFilterValues(values);
      else localStorage.removeItem(`sp:${key}`);
    } catch {}
  }, [key]);

  const persist = (_searchText: string, values: T) => {
    const expiry = Date.now() + EXPIRE_DAYS * 864e5;
    setFilterValues(values);
    try {
      localStorage.setItem(`sp:${key}`, JSON.stringify({ values, expiry }));
    } catch {}
  };

  return { filterValues, persist };
}
