import { test, expect } from "../fixtures";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders the sign-in form", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();
  });

  test("does not submit when email is empty", async ({ page }) => {
    const email = page.getByRole("textbox", { name: "Email" });
    await expect(email).toHaveAttribute("required", "");
    await page.getByRole("textbox", { name: "Password" }).fill("something");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    // Native required validation blocks submission; user stays on /login.
    await expect(page).toHaveURL(/\/login/);
  });

  test("does not submit when password is empty", async ({ page }) => {
    const password = page.getByRole("textbox", { name: "Password" });
    await expect(password).toHaveAttribute("required", "");
    await page.getByRole("textbox", { name: "Email" }).fill("user@example.com");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.getByRole("textbox", { name: "Email" }).fill("nobody@example.com");
    await page.getByRole("textbox", { name: "Password" }).fill("wrong-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText("Incorrect email or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("password visibility toggle works", async ({ page }) => {
    const password = page.getByRole("textbox", { name: "Password" });
    await password.fill("secret123");
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
  });
});

test.describe("Route protection", () => {
  test("redirects unauthenticated users from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects unauthenticated users from a repo page to /login", async ({ page }) => {
    await page.goto("/repos/some-id/test-cases");
    await expect(page).toHaveURL(/\/login/);
  });
});
