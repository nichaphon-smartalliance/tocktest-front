import { renderHook, waitFor, act } from '@testing-library/react';
import { useCommitList } from './useCommitList';
import { createQueryWrapper } from '@/test/helpers/query-wrapper';
import { getCommits, getBranches, analyzeCommit } from '@/services/analysis.service';

vi.mock('@/services/analysis.service', () => ({
  getCommits: vi.fn(),
  getBranches: vi.fn(),
  analyzeCommit: vi.fn(),
  getWhatToTest: vi.fn(),
  reviewPullRequest: vi.fn(),
  reviewAndCommentPullRequest: vi.fn(),
}));

const mockGetCommits = vi.mocked(getCommits);
const mockGetBranches = vi.mocked(getBranches);
const mockAnalyzeCommit = vi.mocked(analyzeCommit);

const makeCommit = (overrides = {}) => ({
  id: 'c-1',
  commitSha: 'abc123',
  commitMessage: 'Fix bug',
  authorName: 'Jane',
  committedAt: new Date('2024-01-01').toISOString(),
  aiSummary: null,
  riskLevel: null,
  filesChanged: 2,
  additions: 10,
  deletions: 3,
  analyzedAt: null,
  ...overrides,
});

describe('useCommitList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBranches.mockResolvedValue([{ name: 'main', commitSha: 'abc123' }]);
  });

  describe('commits query', () => {
    it('does not fetch when repoId is empty', () => {
      mockGetCommits.mockResolvedValue({ items: [], total: 0 });
      const { Wrapper } = createQueryWrapper();
      renderHook(() => useCommitList(''), { wrapper: Wrapper });
      expect(mockGetCommits).not.toHaveBeenCalled();
    });

    it('returns commits and branches after successful fetch', async () => {
      const commit = makeCommit();
      mockGetCommits.mockResolvedValue({ items: [commit as any], total: 1 });
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useCommitList('repo-1'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.commits).toEqual([commit]);
      expect(result.current.total).toBe(1);

      await waitFor(() => expect(result.current.branchesLoading).toBe(false));
      expect(result.current.branches).toEqual([{ name: 'main', commitSha: 'abc123' }]);
    });

    it('defaults to empty list when the service call fails', async () => {
      mockGetCommits.mockRejectedValue(new Error('network error'));
      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useCommitList('repo-1'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.commits).toEqual([]);
      expect(result.current.total).toBe(0);
    });
  });

  describe('analyze mutation', () => {
    it('patches the matching commit in the cache on success', async () => {
      const commit = makeCommit({ riskLevel: null, aiSummary: null });
      mockGetCommits.mockResolvedValue({ items: [commit as any], total: 1 });
      mockAnalyzeCommit.mockResolvedValue({
        summary: 'Looks risky',
        riskLevel: 'high',
        testSuggestions: [],
        affectedAreas: [],
      });

      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useCommitList('repo-1'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.commits).toHaveLength(1));

      await act(() => result.current.analyze('abc123'));

      expect(mockAnalyzeCommit).toHaveBeenCalledWith('repo-1', 'abc123');
      await waitFor(() => {
        const updated = result.current.commits.find((c) => c.commitSha === 'abc123');
        expect(updated?.riskLevel).toBe('high');
        expect(updated?.aiSummary).toBe('Looks risky');
      });
    });

    it('propagates an error when analysis fails', async () => {
      mockGetCommits.mockResolvedValue({ items: [makeCommit() as any], total: 1 });
      mockAnalyzeCommit.mockRejectedValue(new Error('analysis failed'));

      const { Wrapper } = createQueryWrapper();
      const { result } = renderHook(() => useCommitList('repo-1'), { wrapper: Wrapper });
      await waitFor(() => expect(result.current.commits).toHaveLength(1));

      let caught: unknown;
      await act(async () => {
        try {
          await result.current.analyze('abc123');
        } catch (err) {
          caught = err;
        }
      });

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toBe('analysis failed');
    });
  });
});
