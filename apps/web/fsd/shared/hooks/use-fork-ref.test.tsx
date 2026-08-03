import { useRef } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useForkRef } from './use-fork-ref';

function Comp() {
  const a = useRef<HTMLDivElement | null>(null);
  const b = useRef<HTMLDivElement | null>(null);
  const ref = useForkRef(a, b);
  return <div ref={ref} data-testid="x" />;
}

describe('useForkRef', () => {
  it('assigns element to both refs', () => {
    const { getByTestId } = render(<Comp />);
    const el = getByTestId('x');
    expect(el).toBeTruthy();
  });
});
