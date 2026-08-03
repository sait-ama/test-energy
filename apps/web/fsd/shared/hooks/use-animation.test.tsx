import { useRef } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAnimation } from './use-animation';

function Box() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { prepareAnimation } = useAnimation(ref, () => ({
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    duration: 10,
  }));

  return (
    <div
      ref={(node) => {
        ref.current = node;
        if (node) prepareAnimation({} as any);
      }}
      data-testid="box"
    />
  );
}

describe('useAnimation', () => {
  it('prepares and triggers animation', () => {
    // Add animate method to HTMLElement prototype before testing
    HTMLElement.prototype.animate = vi.fn().mockReturnValue({
      onfinish: null,
      cancel: vi.fn(),
      playState: 'running',
    });

    const spy = vi.spyOn(HTMLElement.prototype, 'animate');
    const { getByTestId } = render(<Box />);
    expect(getByTestId('box')).toBeTruthy();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
