# Frontend Testing Guide

## Stack

| Tool | Version | Role |
|---|---|---|
| Vitest | 4.x | Test runner |
| @testing-library/react | 16.x | React hook/component testing |
| @testing-library/jest-dom | 6.x | DOM matchers |
| MSW | 2.x | HTTP mocking |
| jsdom | 25.x | Browser-like environment |

## Running Tests

```bash
npm test           # run once
npm run test:watch # interactive watch mode
npm run test:cov   # with coverage report → coverage/
npm run test:ci    # CI mode
```

## File Convention

Co-locate spec files next to the source file:

```
src/hooks/useDebouncedValue.ts
src/hooks/useDebouncedValue.spec.ts   ← here
```

## Test Infrastructure

```
src/test/
  setup.ts                      — jest-dom matchers + MSW lifecycle hooks
  mocks/
    server.ts                   — MSW Node server
    handlers/
      index.ts                  — combines all handler arrays
      repository.handlers.ts
      testCase.handlers.ts
  helpers/
    query-wrapper.tsx           — createQueryWrapper() for React Query
```

## Test Patterns

### Timer-based hooks (useDebouncedValue)

```ts
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('delays update', () => {
  const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v), { initialProps: { v: 'a' } });
  rerender({ v: 'b' });
  act(() => vi.advanceTimersByTime(350));
  expect(result.current).toBe('b');
});
```

### React Query hooks

Always use a fresh `QueryClient` per test via `createQueryWrapper()`:

```ts
const { Wrapper } = createQueryWrapper();
const { result } = renderHook(() => useRepositoryList(), { wrapper: Wrapper });
await waitFor(() => expect(result.current.isLoading).toBe(false));
```

### Service mocking (preferred over MSW for unit tests)

```ts
vi.mock('@/services/repository.service', () => ({ getRepositories: vi.fn() }));
const mockGet = vi.mocked(getRepositories);
mockGet.mockResolvedValue({ items: [], total: 0, totalPages: 1, pageNumber: 0 });
```

### MSW — per-test handler overrides

Default handlers return empty lists. Override for a specific test:

```ts
server.use(
  http.get('/api/backend/repositories', () =>
    HttpResponse.json({ success: true, data: { content: [repo1], totalElements: 1 } })
  )
);
```

Overrides are reset automatically after each test (configured in `setup.ts`).

### Optimistic update testing

1. Pre-populate cache with `queryClient.setQueryData(key, value)`.
2. Trigger the mutation inside `act()`.
3. Assert the cache value changed **before** the mock settles.
4. Resolve the mock, then assert the final state.
5. Test the rejection path rolls the cache back.

## What Is NOT Tested Here

- `src/app/**` pages — use Playwright for E2E.
- React Server Components — require an E2E approach.
- Next.js middleware.

## Coverage

Thresholds: branches 60 %, functions/lines/statements 65 %.

```bash
npm run test:cov
open coverage/index.html
```

## Adding New Tests

1. Create `src/path/to/hook.spec.ts` next to the hook.
2. Import the hook under test.
3. Mock services with `vi.mock(...)`, not actual HTTP calls.
4. Wrap with `createQueryWrapper()` if the hook uses React Query.
5. Use `waitFor` for async assertions.
