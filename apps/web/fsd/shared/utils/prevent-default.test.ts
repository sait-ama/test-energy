import { preventDefault, SytheticEventPreventer } from './prevent-default';

describe('preventDefault', () => {
  test('calls preventDefault on event', () => {
    const mockEvent = {
      preventDefault: vi.fn(),
    };
    preventDefault(mockEvent as any);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });
});

describe('SytheticEventPreventer', () => {
  let preventer: SytheticEventPreventer;
  let mockEvent: any;

  beforeEach(() => {
    preventer = new SytheticEventPreventer();
    mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: {
        stopImmediatePropagation: vi.fn(),
      },
    };
  });

  test('chains methods correctly', () => {
    const result = preventer.default().propagation().immediatePropagation();
    expect(result).toBe(preventer);
  });

  test('prevents default', () => {
    preventer.default().process(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  test('stops propagation', () => {
    preventer.propagation().process(mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  test('stops immediate propagation', () => {
    preventer.immediatePropagation().process(mockEvent);
    expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
  });

  test('handles multiple actions', () => {
    preventer.default().propagation().process(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
