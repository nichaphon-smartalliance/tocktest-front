import { renderHook, waitFor } from '@testing-library/react';
import { useRepositoryList } from './useRepositoryList';
import { createQueryWrapper } from '@/test/helpers/query-wrapper';
import { getRepositories } from '@/services/repository.service';

vi.mock('@/services/repository.service', () => ({
  getRepositories: vi.fn(),
}));

const mockGetRepositories = vi.mocked(getRepositories);

const repo1 = { id: 'r1', fullName: 'owner/repo-1', name: 'repo-1' } as any;

describe('useRepositoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty defaults while loading', () => {
    mockGetRepositories.mockReturnValue(new Promise(() => {})); // never resolves
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRepositoryList(), { wrapper: Wrapper });

    expect(result.current.repositories).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('returns repositories after successful fetch', async () => {
    mockGetRepositories.mockResolvedValue({ items: [repo1], total: 1, totalPages: 1, pageNumber: 1 });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRepositoryList(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.repositories).toEqual([repo1]);
    expect(result.current.total).toBe(1);
  });

  it('defaults to empty list when service returns undefined data', async () => {
    mockGetRepositories.mockResolvedValue({ items: [], total: 0, totalPages: 1, pageNumber: 0 });
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRepositoryList(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.repositories).toEqual([]);
  });

  it('passes params to the service function', async () => {
    mockGetRepositories.mockResolvedValue({ items: [], total: 0, totalPages: 1, pageNumber: 0 });
    const { Wrapper } = createQueryWrapper();
    const params = { search: 'my-repo' };
    renderHook(() => useRepositoryList(params), { wrapper: Wrapper });

    await waitFor(() => expect(mockGetRepositories).toHaveBeenCalledWith(params));
  });

  it('different params result in separate service calls', async () => {
    mockGetRepositories.mockResolvedValue({ items: [], total: 0, totalPages: 1, pageNumber: 0 });
    const { Wrapper: Wrapper1 } = createQueryWrapper();
    const { Wrapper: Wrapper2 } = createQueryWrapper();

    renderHook(() => useRepositoryList({ search: 'a' }), { wrapper: Wrapper1 });
    renderHook(() => useRepositoryList({ search: 'b' }), { wrapper: Wrapper2 });

    await waitFor(() => expect(mockGetRepositories).toHaveBeenCalledTimes(2));
    expect(mockGetRepositories).toHaveBeenCalledWith({ search: 'a' });
    expect(mockGetRepositories).toHaveBeenCalledWith({ search: 'b' });
  });
});
