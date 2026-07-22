import { renderHook, waitFor } from '@testing-library/react';
import { useBranches } from './useBranches';
import { createQueryWrapper } from '@/test/helpers/query-wrapper';
import { getBranches } from '@/services/analysis.service';

vi.mock('@/services/analysis.service', () => ({
  getBranches: vi.fn(),
}));

const mockGetBranches = vi.mocked(getBranches);

describe('useBranches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch when repoId is empty', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useBranches(''), { wrapper: Wrapper });
    expect(mockGetBranches).not.toHaveBeenCalled();
  });

  it('does not fetch when enabled is false', () => {
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useBranches('repo-1', false), { wrapper: Wrapper });
    expect(mockGetBranches).not.toHaveBeenCalled();
  });

  it('returns branches after a successful fetch', async () => {
    mockGetBranches.mockResolvedValue([{ name: 'main', commitSha: 'sha1' }, { name: 'dev', commitSha: 'sha2' }]);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBranches('repo-1'), { wrapper: Wrapper });

    expect(result.current.branchesLoading).toBe(true);
    await waitFor(() => expect(result.current.branchesLoading).toBe(false));

    expect(result.current.branches).toEqual([
      { name: 'main', commitSha: 'sha1' },
      { name: 'dev', commitSha: 'sha2' },
    ]);
    expect(mockGetBranches).toHaveBeenCalledWith('repo-1');
  });

  it('defaults to an empty list when the fetch fails', async () => {
    mockGetBranches.mockRejectedValue(new Error('network error'));
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useBranches('repo-1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.branchesLoading).toBe(false));
    expect(result.current.branches).toEqual([]);
  });
});
