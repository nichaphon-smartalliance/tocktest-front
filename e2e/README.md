# E2E Tests (Playwright)

End-to-end tests that drive the real app in a browser. These complement the
Vitest unit tests, which do **not** cover `src/app/**` pages.

## Layout

```
e2e/
  fixtures.ts              — shared test fixture (pins locale to English)
  auth.setup.ts            — logs in once, saves session to .auth/user.json
  public/                  — tests that need no login (run out of the box)
    login.spec.ts
  authenticated/           — tests that reuse the saved session
    helpers.ts             — openFirstRepo() + skip guards
    dashboard.spec.ts
    test-cases.spec.ts     — deeper QA workflow: test-case toolbar, create/AI modals, filters
    analysis.spec.ts       — deeper QA workflow: branch selector, PR review, what-to-test
```

## Running

Public tests need no credentials:

```bash
npm run test:e2e -- --project=public
```

Authenticated tests need a real account. Provide credentials via env vars —
never commit them:

```bash
# PowerShell
$env:E2E_EMAIL="admin@tocktest.com"; $env:E2E_PASSWORD="..."; npm run test:e2e

# bash
E2E_EMAIL=admin@tocktest.com E2E_PASSWORD=... npm run test:e2e
```

If `E2E_EMAIL` / `E2E_PASSWORD` are unset, the `setup` project is skipped and
the authenticated tests are skipped with it — so `npm run test:e2e` always
passes on the parts it can actually run.

The dev server must be reachable at `http://localhost:4003` (Playwright reuses a
running one, or starts `npm run dev` automatically). Override with `E2E_BASE_URL`.

## Other commands

```bash
npm run test:e2e:ui       # interactive UI mode
npm run test:e2e:report   # open the last HTML report
```
