import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useRecentRepos, trackRecentRepo } from "./useRecentRepos";

const STORAGE_KEY = "tock:recent-repos";

afterEach(() => {
  localStorage.clear();
});

describe("useRecentRepos", () => {
  it("returns empty when storage is empty", () => {
    const { result } = renderHook(() => useRecentRepos());
    expect(result.current.recent).toEqual([]);
  });

  it("reads existing entries from storage", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "1", fullName: "a/b", visitedAt: 1 }]),
    );
    const { result } = renderHook(() => useRecentRepos());
    expect(result.current.recent).toHaveLength(1);
    expect(result.current.recent[0].id).toBe("1");
  });

  it("updates when trackRecentRepo writes a new entry", () => {
    const { result } = renderHook(() => useRecentRepos());
    act(() => trackRecentRepo("42", "owner/repo"));
    expect(result.current.recent[0]).toMatchObject({ id: "42", fullName: "owner/repo" });
  });

  it("moves a re-visited repo to the front without duplicating", () => {
    const { result } = renderHook(() => useRecentRepos());
    act(() => trackRecentRepo("1", "a/one"));
    act(() => trackRecentRepo("2", "a/two"));
    act(() => trackRecentRepo("1", "a/one"));
    expect(result.current.recent.map((r) => r.id)).toEqual(["1", "2"]);
  });

  it("returns a stable reference when storage is unchanged", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "1", fullName: "a/b", visitedAt: 1 }]),
    );
    const { result, rerender } = renderHook(() => useRecentRepos());
    const first = result.current.recent;
    rerender();
    expect(result.current.recent).toBe(first);
  });
});
