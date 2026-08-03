import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLocalStorageState } from './use-local-storage-state';

describe('useLocalStorageState', () => {
  it('reads and writes to localStorage, syncs via storage event', () => {
    const { result } = renderHook(() => useLocalStorageState('k', 1));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](2));
    expect(window.localStorage.getItem('k')).toBe('2');

    act(() =>
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'k', newValue: '3', storageArea: window.localStorage })
      )
    );
    expect(result.current[0]).toBe(3);
  });
});
