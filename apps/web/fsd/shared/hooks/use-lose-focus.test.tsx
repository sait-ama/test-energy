import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useLoseFocus } from './use-lose-focus';

describe('useLoseFocus', () => {
  it('resets focus when disabled becomes true', () => {
    const cb = vi.fn();
    const { result, rerender } = renderHook(({ disabled }) => useLoseFocus(cb, disabled), {
      initialProps: { disabled: false },
    });

    // Simulate focus first
    result.current.onFocus();

    rerender({ disabled: true });
    expect(cb).toHaveBeenCalled();
  });
});
