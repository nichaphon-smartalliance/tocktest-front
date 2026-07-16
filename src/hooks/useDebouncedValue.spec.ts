import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useDebouncedValue', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello'));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v), {
      initialProps: { v: 'initial' },
    });
    rerender({ v: 'updated' });

    act(() => vi.advanceTimersByTime(349));
    expect(result.current).toBe('initial');
  });

  it('updates after the default delay (350 ms)', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v), {
      initialProps: { v: 'initial' },
    });
    rerender({ v: 'updated' });

    act(() => vi.advanceTimersByTime(350));
    expect(result.current).toBe('updated');
  });

  it('respects a custom delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 500), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });

    act(() => vi.advanceTimersByTime(499));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('b');
  });

  it('only fires for the last value when changed multiple times rapidly', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v), {
      initialProps: { v: 'first' },
    });
    rerender({ v: 'second' });
    rerender({ v: 'third' });

    act(() => vi.advanceTimersByTime(350));
    expect(result.current).toBe('third');
  });

  it('does not cause state updates after unmount', () => {
    const { rerender, unmount } = renderHook(({ v }) => useDebouncedValue(v), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    unmount();
    // Advancing timers after unmount must not throw
    expect(() => act(() => vi.advanceTimersByTime(350))).not.toThrow();
  });
});
