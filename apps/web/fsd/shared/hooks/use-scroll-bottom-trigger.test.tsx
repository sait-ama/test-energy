import React from 'react';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useScrollBottomTrigger } from './use-scroll-bottom-trigger';

describe('useScrollBottomTrigger', () => {
  it('detects scroll at bottom and calls fn', () => {
    const fn = vi.fn();
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { value: 1000 });
    const containerRef = { current: container } as unknown as React.MutableRefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useScrollBottomTrigger({ fn, containerRef, canTrigger: true })
    );
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 950, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 100, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(fn).toHaveBeenCalled();
    expect(result.current.detectScrollAtBottom(() => {}, 200)).toBe(true);
  });
});
