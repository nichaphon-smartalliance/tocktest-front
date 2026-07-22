import { renderHook, waitFor, act } from '@testing-library/react';
import { useProjectDoc } from './useProjectDoc';
import { createQueryWrapper } from '@/test/helpers/query-wrapper';
import { getProjectDoc, getDocStatus, updateProjectDoc, getDocVersions } from '@/services/docs.service';

vi.mock('@/services/docs.service', () => ({
  getProjectDoc: vi.fn(),
  getDocStatus: vi.fn(),
  updateProjectDoc: vi.fn(),
  generateDoc: vi.fn(),
  refreshDoc: vi.fn(),
  autoUpdateDoc: vi.fn(),
  getDocVersions: vi.fn(),
  deleteProjectDoc: vi.fn(),
}));

const mockGetProjectDoc = vi.mocked(getProjectDoc);
const mockGetDocStatus = vi.mocked(getDocStatus);
const mockUpdateProjectDoc = vi.mocked(updateProjectDoc);
const mockGetDocVersions = vi.mocked(getDocVersions);

const makeDoc = (overrides = {}) => ({
  id: 'doc-1',
  repoId: 'repo-1',
  content: '# Docs',
  version: 1,
  updatedAt: new Date('2024-01-01').toISOString(),
  ...overrides,
});

// "idle" keeps the status-driven refetch effect and refetchInterval polling inert for these tests.
const makeStatus = (overrides = {}) => ({
  status: 'idle' as const,
  message: null,
  lastGeneratedAt: null,
  lastCommitSha: null,
  lastSourceSha: null,
  autoSync: false,
  offlineMode: false,
  isStale: false,
  ...overrides,
});

describe('useProjectDoc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDocStatus.mockResolvedValue(makeStatus());
    mockGetDocVersions.mockResolvedValue([]);
  });

  it('does not fetch when repoId is empty', () => {
    mockGetProjectDoc.mockResolvedValue(makeDoc());
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useProjectDoc(''), { wrapper: Wrapper });
    expect(mockGetProjectDoc).not.toHaveBeenCalled();
  });

  it('returns the doc, versions, and status after a successful fetch', async () => {
    const doc = makeDoc();
    mockGetProjectDoc.mockResolvedValue(doc);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProjectDoc('repo-1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.doc).toEqual(doc);
    expect(result.current.versions).toEqual([]);
    await waitFor(() => expect(result.current.status?.status).toBe('idle'));
  });

  it('updates the doc content and invalidates the doc query on success', async () => {
    mockGetProjectDoc.mockResolvedValue(makeDoc({ content: 'old' }));
    mockUpdateProjectDoc.mockResolvedValue(makeDoc({ content: 'new' }));

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProjectDoc('repo-1'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(() => result.current.update('new'));

    expect(mockUpdateProjectDoc).toHaveBeenCalledWith('repo-1', 'new');
    await waitFor(() => expect(mockGetProjectDoc).toHaveBeenCalledTimes(2));
  });

  it('rejects when updating the doc fails', async () => {
    mockGetProjectDoc.mockResolvedValue(makeDoc());
    mockUpdateProjectDoc.mockRejectedValue(new Error('save failed'));

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useProjectDoc('repo-1'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.update('new content');
      } catch (err) {
        caught = err;
      }
    });

    expect(caught).toBeInstanceOf(Error);
  });
});
