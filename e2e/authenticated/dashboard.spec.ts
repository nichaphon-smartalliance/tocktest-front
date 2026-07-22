import { test, expect } from "@playwright/test";

// These tests reuse the session saved by auth.setup.ts (storageState in the
// playwright config). If E2E_EMAIL / E2E_PASSWORD are not set, setup produces
// no session file and this whole project is skipped by the runner.

test.describe("Dashboard (authenticated)", () => {
  test.skip(
    !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
    "Set E2E_EMAIL and E2E_PASSWORD to run authenticated tests.",
  );

  test("loads the dashboard after login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows the repository toolbar", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /GitHub Token/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sync repositories from GitHub/i })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: /Search repository/i })).toBeVisible();
  });

  test("opens the Add GitHub Token modal", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /GitHub Token/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("dashboard is reachable directly without redirect to login", async ({ page }) => {
    const response = await page.goto("/dashboard");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveURL(/\/login/);
  });
});
