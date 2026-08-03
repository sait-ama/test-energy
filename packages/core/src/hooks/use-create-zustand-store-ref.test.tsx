import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useCreateZustandStoreRef } from './use-create-zustand-store-ref';

describe('useCreateZustandStoreRef', () => {
  it('creates store only once and returns same object', () => {
    const createStore = vi.fn(() => ({ id: Math.random() }));
    const { result, rerender } = renderHook(
      ({ initialState }) => useCreateZustandStoreRef(createStore, initialState),
      {
        initialProps: { initialState: 1 },
      }
    );
    const first = result.current;
    rerender({ initialState: 2 });
    expect(result.current).toBe(first);
    expect(createStore).toHaveBeenCalledTimes(1);
  });

  it('passes initialState to createStore', () => {
    const createStore = vi.fn((init) => ({ init }));
    const { result } = renderHook(() => useCreateZustandStoreRef(createStore, 123));
    expect(result.current.init).toBe(123);
  });
});
