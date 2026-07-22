import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

setup("authenticate", async ({ page, context, baseURL }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  // No credentials → write an empty session so the authenticated project can
  // still load its storageState. Those specs self-skip when creds are absent.
  if (!EMAIL || !PASSWORD) {
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
    setup.skip(true, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated tests.");
    return;
  }

  const url = new URL(baseURL ?? "http://localhost:4003");
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "en", domain: url.hostname, path: "/" },
  ]);

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(EMAIL!);
  await page.getByRole("textbox", { name: "Password" }).fill(PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  // A successful credentials login redirects to the dashboard.
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await expect(page).toHaveURL(/\/dashboard/);

  await context.storageState({ path: AUTH_FILE });
});
