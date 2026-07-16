import { renderHook, waitFor, act } from '@testing-library/react';
import { useTestCaseList } from './useTestCaseList';
import { createQueryWrapper } from '@/test/helpers/query-wrapper';
import { getTestCases, createTestCase, updateTestCase, deleteTestCase } from '@/services/testCase.service';
import { QA_SUMMARY_QUERY_KEY } from '@/hooks/dashboard/useQaSummary';

vi.mock('@/services/testCase.service', () => ({
  getTestCases: vi.fn(),
  createTestCase: vi.fn(),
  updateTestCase: vi.fn(),
  deleteTestCase: vi.fn(),
}));

const mockGetTestCases = vi.mocked(getTestCases);
const mockCreateTestCase = vi.mocked(createTestCase);
const mockUpdateTestCase = vi.mocked(updateTestCase);
const mockDeleteTestCase = vi.mocked(deleteTestCase);

const makeTestCase = (overrides = {}) => ({
  id: 'tc-1',
  title: 'Login works',
  status: 'not_tested',
  priority: 'high',
  testType: 'manual',
  updatedAt: new Date('2024-01-01').toISOString(),
  ...overrides,
});

const makeQaSummary = () => ({
  byStatus: { pass: 5, fail: 2, blocked: 1, not_tested: 3 },
  passRate: 62,
  total: 11,
});

describe('useTestCaseList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTestCases.mockResolvedValue({ items: [], total: 0 });
  });

  describe('query', () => {
    it('does not fetch when repoId is empty', () => {
      const { Wrapper } = createQueryWrapper();
      renderHook(() => useTestCaseList(''), { wrapper: Wrapper });
      expect(mockGetTestCases).not.toHaveBeenCalled();
    });

    it('returns test cases after successful fetch', async () => {
      const tc = makeTestCase();
      mockGetTestCases.mockResolvedValue({ items: [tc as any], total: 1 });
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useTestCaseList('repo-1'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.testCases).toEqual([tc]);
      expect(result.current.total).toBe(1);
    });
  });

  describe('create mutation', () => {
    it('calls createTestCase with the repoId and form values', async () => {
      const newTc = makeTestCase({ id: 'tc-new' });
      mockCreateTestCase.mockResolvedValue(newTc as any);
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useTestCaseList('repo-1'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(() => result.current.create({ title: 'New test' } as any));

      expect(mockCreateTestCase).toHaveBeenCalledWith('repo-1', { title: 'New test' });
    });
  });

  describe('update mutation — optimistic update', () => {
    it('updates the item in the cache optimistically before the server responds', async () => {
      const tc = makeTestCase({ status: 'not_tested' });
      mockGetTestCases.mockResolvedValue({ items: [tc as any], total: 1 });
      let resolveUpdate!: (v: any) => void;
      mockUpdateTestCase.mockReturnValue(new Promise((r) => { resolveUpdate = r; }));

      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useTestCaseList('repo-1'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.testCases).toHaveLength(1));

      act(() => { result.current.update({ id: 'tc-1', values: { status: 'pass' } }); });

      await waitFor(() => {
        const updated = result.current.testCases.find((t) => t.id === 'tc-1');
        expect(updated?.status).toBe('pass');
      });

      // Resolve and clean up
      resolveUpdate(makeTestCase({ status: 'pass' }));
    });

    it('rolls back on error', async () => {
      const tc = makeTestCase({ status: 'not_tested' });
      mockGetTestCases.mockResolvedValue({ items: [tc as any], total: 1 });
      mockUpdateTestCase.mockRejectedValue(new Error('server error'));

      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useTestCaseList('repo-1'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.testCases).toHaveLength(1));

      await act(async () => {
        try {
          await result.current.update({ id: 'tc-1', values: { status: 'pass' } });
        } catch {
          // expected error
        }
      });

      await waitFor(() => {
        const tc1 = result.current.testCases.find((t) => t.id === 'tc-1');
        expect(tc1?.status).toBe('not_tested');
      });
    });

    it('adjusts QA summary optimistically when status changes', async () => {
      const tc = makeTestCase({ status: 'fail' });
      mockGetTestCases.mockResolvedValue({ items: [tc as any], total: 1 });
      let resolveUpdate!: (v: any) => void;
      mockUpdateTestCase.mockReturnValue(new Promise((r) => { resolveUpdate = r; }));

      const { Wrapper, queryClient } = createQueryWrapper();
      queryClient.setQueryData(QA_SUMMARY_QUERY_KEY, makeQaSummary());

      const { result } = renderHook(() => useTestCaseList('repo-1'), { wrapper: Wrapper });
      await waitFor(() => expect(result.current.testCases).toHaveLength(1));

      // flush the async onMutate (cancelQueries is awaited inside)
      await act(async () => {
        void result.current.update({ id: 'tc-1', values: { status: 'pass' } });
        await Promise.resolve(); // let onMutate's first await settle
      });

      await waitFor(() => {
        const summary = queryClient.getQueryData<ReturnType<typeof makeQaSummary>>(QA_SUMMARY_QUERY_KEY);
        expect(summary?.byStatus.fail).toBe(1); // was 2, decremented
        expect(summary?.byStatus.pass).toBe(6); // was 5, incremented
      });

      resolveUpdate(makeTestCase({ status: 'pass' }));
    });
  });

  describe('remove mutation', () => {
    it('calls deleteTestCase with repoId and id', async () => {
      mockDeleteTestCase.mockResolvedValue(undefined);
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useTestCaseList('repo-1'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(() => result.current.remove('tc-1'));

      expect(mockDeleteTestCase).toHaveBeenCalledWith('repo-1', 'tc-1');
    });
  });
});
