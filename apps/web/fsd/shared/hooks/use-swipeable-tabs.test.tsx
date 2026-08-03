import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSwipeableTabs } from './use-swipeable-tabs';

function TabsComp({ onChange }: { onChange: (o: { value: string; action: string }) => void }) {
  const handlers = useSwipeableTabs({ variants: ['a', 'b'], value: 'a', onChange });
  return <div data-testid="swipe" {...handlers} />;
}

interface SwipeConfig {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  onSwiped?: () => void;
}

declare global {
  var swipeConfig: SwipeConfig;
}

// Mock react-swipeable to simulate swipe events
vi.mock('react-swipeable', () => ({
  useSwipeable: (config: SwipeConfig) => {
    // Store the config so we can trigger callbacks directly
    global.swipeConfig = config;
    return {
      onTouchStart: vi.fn(),
      onTouchEnd: vi.fn(),
    };
  },
}));

describe('useSwipeableTabs', () => {
  it('calls onChange on swipe', () => {
    const onChange = vi.fn();
    render(<TabsComp onChange={onChange} />);

    // Directly trigger the swipe callback
    const swipeConfig: SwipeConfig = global.swipeConfig;
    if (swipeConfig && swipeConfig.onSwipedLeft) {
      swipeConfig.onSwipedLeft();
    }

    expect(onChange).toHaveBeenCalledWith({
      value: 'b', // Should move from 'a' to 'b'
      action: 'next',
    });
  });
});
