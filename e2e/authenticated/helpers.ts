import { Page, test } from "@playwright/test";

export const hasCreds = !!process.env.E2E_EMAIL && !!process.env.E2E_PASSWORD;

/**
 * Navigate from the dashboard into the first repository's workspace.
 * Returns the repoId, or null if the account has no repositories (caller skips).
 */
export async function openFirstRepo(page: Page): Promise<string | null> {
  await page.goto("/dashboard");
  const firstRepo = page.getByRole("link", { name: /open/i }).first();

  if ((await firstRepo.count()) === 0) return null;

  await firstRepo.click();
  await page.waitForURL(/\/repos\/[^/]+\/test-cases/, { timeout: 15_000 });

  const match = page.url().match(/\/repos\/([^/]+)\//);
  return match?.[1] ?? null;
}

/** Skip the current test when the logged-in account has no repositories. */
export function skipIfNoRepo(repoId: string | null): asserts repoId is string {
  test.skip(!repoId, "Logged-in account has no repositories to exercise.");
}
