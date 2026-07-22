import { test, expect } from "@playwright/test";
import { hasCreds, openFirstRepo, skipIfNoRepo } from "./helpers";

// Deeper QA workflow: the test-case management page. Reuses the saved session
// (storageState). Skips entirely without E2E_EMAIL / E2E_PASSWORD, and skips
// per-test if the account has no repositories to open.

test.describe("Test cases workflow", () => {
  test.skip(!hasCreds, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated tests.");

  test("opens a repo and shows the test-case toolbar", async ({ page }) => {
    const repoId = await openFirstRepo(page);
    skipIfNoRepo(repoId);

    await expect(page).toHaveURL(/\/repos\/[^/]+\/test-cases/);
    await expect(page.getByRole("button", { name: "New Test Case" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate with AI" })).toBeVisible();
    await expect(page.getByRole("searchbox")).toBeVisible();
  });

  test("opens the New Test Case modal", async ({ page }) => {
    const repoId = await openFirstRepo(page);
    skipIfNoRepo(repoId);

    await page.getByRole("button", { name: "New Test Case" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("opens the AI generation modal", async ({ page }) => {
    const repoId = await openFirstRepo(page);
    skipIfNoRepo(repoId);

    await page.getByRole("button", { name: "Generate with AI" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("status/priority/type filters are present", async ({ page }) => {
    const repoId = await openFirstRepo(page);
    skipIfNoRepo(repoId);

    // Three HeroUI Select triggers (status, priority, type) render as buttons.
    const selects = page.getByRole("button", { name: /Status|Priority|Type/i });
    await expect(selects.first()).toBeVisible();
  });
});
