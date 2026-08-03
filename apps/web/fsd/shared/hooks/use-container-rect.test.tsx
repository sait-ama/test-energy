import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useContainerRect } from './use-container-rect';

function Comp() {
  const { setContainerRef, containerRect, isInitialized } = useContainerRect();
  return (
    <div>
      <div
        ref={setContainerRef as any}
        data-testid="c"
        style={{ padding: '10px', width: '100px', height: '100px' }}
      />
      <div data-testid="inited">{String(isInitialized)}</div>
      <div data-testid="rect">{JSON.stringify(containerRect)}</div>
    </div>
  );
}

describe('useContainerRect', () => {
  it('computes rect and initializes', () => {
    // Mock ResizeObserver
    (window as any).ResizeObserver = function () {
      return { observe() {}, disconnect() {} };
    } as any;

    // Mock requestAnimationFrame to execute callbacks immediately
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = (callback) => {
      callback(0);
      return 1;
    };

    // Mock getComputedStyle
    global.getComputedStyle = () =>
      ({
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingTop: '10px',
        paddingBottom: '10px',
      }) as any;

    const { getByTestId } = render(<Comp />);

    act(() => {
      // RAF callback should have executed during render
    });

    expect(getByTestId('inited').textContent).toBe('true');

    // Restore original RAF
    global.requestAnimationFrame = originalRAF;
  });
});
