import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useBoolean } from './use-boolean';

describe('useBoolean', () => {
  it('toggles value and supports setValue', () => {
    const { result } = renderHook(() => useBoolean(false));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
    act(() => result.current[2](true));
    expect(result.current[0]).toBe(true);
  });
});
