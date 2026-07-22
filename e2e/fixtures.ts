import { test as base, expect } from "@playwright/test";

// Pin the app locale to English so assertions match a stable language.
// The app reads locale from the NEXT_LOCALE cookie (default is Thai).
export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    const url = new URL(baseURL ?? "http://localhost:4003");
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        domain: url.hostname,
        path: "/",
      },
    ]);
    await use(context);
  },
});

export { expect };
