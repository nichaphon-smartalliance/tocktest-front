import { renderHook, waitFor, act } from '@testing-library/react';
import { useRepoSettings } from './useRepoSettings';
import { createQueryWrapper } from '@/test/helpers/query-wrapper';
import { getRepoSettings, updateRepoSettings } from '@/services/settings.service';

vi.mock('@/services/settings.service', () => ({
  getRepoSettings: vi.fn(),
  updateRepoSettings: vi.fn(),
}));

const mockGetRepoSettings = vi.mocked(getRepoSettings);
const mockUpdateRepoSettings = vi.mocked(updateRepoSettings);

const makeSettings = (overrides = {}) => ({
  defaultBranch: 'main',
  autoAnalyzeOnPush: true,
  aiProvider: 'openai',
  aiModel: 'gpt-4',
  aiOfflineMode: false,
  docsAutoSync: true,
  ...overrides,
});

describe('useRepoSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch when repoId is empty', () => {
    mockGetRepoSettings.mockResolvedValue(makeSettings() as any);
    const { Wrapper } = createQueryWrapper();
    renderHook(() => useRepoSettings(''), { wrapper: Wrapper });
    expect(mockGetRepoSettings).not.toHaveBeenCalled();
  });

  it('returns settings after a successful fetch', async () => {
    const settings = makeSettings();
    mockGetRepoSettings.mockResolvedValue(settings as any);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRepoSettings('repo-1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.settings).toEqual(settings);
    expect(mockGetRepoSettings).toHaveBeenCalledWith('repo-1');
  });

  it('updates settings and invalidates the query on success', async () => {
    mockGetRepoSettings.mockResolvedValue(makeSettings({ aiOfflineMode: false }) as any);
    mockUpdateRepoSettings.mockResolvedValue(makeSettings({ aiOfflineMode: true }) as any);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRepoSettings('repo-1'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(() => result.current.update({ aiOfflineMode: true }));

    expect(mockUpdateRepoSettings).toHaveBeenCalledWith('repo-1', { aiOfflineMode: true });
    await waitFor(() => expect(mockGetRepoSettings).toHaveBeenCalledTimes(2));
  });

  it('rejects when the update fails', async () => {
    mockGetRepoSettings.mockResolvedValue(makeSettings() as any);
    mockUpdateRepoSettings.mockRejectedValue(new Error('save failed'));

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useRepoSettings('repo-1'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.update({ aiOfflineMode: true });
      } catch (err) {
        caught = err;
      }
    });

    expect(caught).toBeInstanceOf(Error);
  });
});
