import { test, expect } from "@playwright/test";
import { hasCreds, openFirstRepo, skipIfNoRepo } from "./helpers";

// Deeper QA workflow: the AI commit-analysis page (risk scoring, "what to test",
// PR review). Reuses the saved session and skips gracefully without creds/repos.

test.describe("Analysis workflow", () => {
  test.skip(!hasCreds, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated tests.");

  test("navigates to the analysis page for a repo", async ({ page }) => {
    const repoId = await openFirstRepo(page);
    skipIfNoRepo(repoId);

    await page.goto(`/repos/${repoId}/analysis`);
    await expect(page).toHaveURL(/\/repos\/[^/]+\/analysis/);
    // Page should not bounce to login and should render without a client error.
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("shows the branch selector and PR review controls", async ({ page }) => {
    const repoId = await openFirstRepo(page);
    skipIfNoRepo(repoId);

    await page.goto(`/repos/${repoId}/analysis`);
    await expect(page.getByText("Select Branch")).toBeVisible();
    await expect(page.getByRole("button", { name: "Review PR" })).toBeVisible();
  });

  test("the what-to-test prompt is present", async ({ page }) => {
    const repoId = await openFirstRepo(page);
    skipIfNoRepo(repoId);

    await page.goto(`/repos/${repoId}/analysis`);
    await expect(
      page.getByText("What should be tested after these commits?"),
    ).toBeVisible();
  });
});
