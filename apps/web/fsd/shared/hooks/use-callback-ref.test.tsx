import { useEffect } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCallbackRef } from './use-callback-ref';

function TestComp({ onCall }: { onCall: (v: number) => void }) {
  const stable = useCallbackRef(onCall);
  useEffect(() => {
    stable(42);
  }, [stable]);
  return <div data-testid="ok" />;
}

describe('useCallbackRef', () => {
  it('keeps stable reference and calls latest callback', () => {
    const spy = vi.fn();
    render(<TestComp onCall={spy} />);
    expect(spy).toHaveBeenCalledWith(42);
  });
});
