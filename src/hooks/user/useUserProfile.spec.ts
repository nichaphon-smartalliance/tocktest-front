import { renderHook, waitFor, act } from '@testing-library/react';
import { useUserProfile } from './useUserProfile';
import { createQueryWrapper } from '@/test/helpers/query-wrapper';
import { getUserProfile, updateUserProfile } from '@/services/user.service';

vi.mock('@/services/user.service', () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}));

const mockGetUserProfile = vi.mocked(getUserProfile);
const mockUpdateUserProfile = vi.mocked(updateUserProfile);

const makeProfile = (overrides = {}) => ({
  id: 'u-1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'user',
  createdAt: new Date('2024-01-01').toISOString(),
  ...overrides,
});

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns undefined profile while loading', () => {
    mockGetUserProfile.mockReturnValue(new Promise(() => {})); // never resolves
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });

    expect(result.current.profile).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('returns the profile after a successful fetch', async () => {
    const profile = makeProfile();
    mockGetUserProfile.mockResolvedValue(profile as any);
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profile).toEqual(profile);
  });

  it('updates the profile and invalidates the query on success', async () => {
    mockGetUserProfile.mockResolvedValue(makeProfile({ name: 'Jane Doe' }) as any);
    mockUpdateUserProfile.mockResolvedValue(makeProfile({ name: 'Jane Updated' }) as any);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(() => result.current.updateProfile('Jane Updated'));

    expect(mockUpdateUserProfile).toHaveBeenCalledWith('Jane Updated');
    await waitFor(() => expect(mockGetUserProfile).toHaveBeenCalledTimes(2));
  });

  it('rejects when updating the profile fails', async () => {
    mockGetUserProfile.mockResolvedValue(makeProfile() as any);
    mockUpdateUserProfile.mockRejectedValue(new Error('update failed'));

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.updateProfile('New name');
      } catch (err) {
        caught = err;
      }
    });

    expect(caught).toBeInstanceOf(Error);
  });
});
