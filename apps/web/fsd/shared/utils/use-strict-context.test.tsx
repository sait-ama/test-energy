import { createContext } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useStrictContext } from './use-strict-context';

const Ctx = createContext<number | null>(null);

function Consumer() {
  const value = useStrictContext(Ctx);
  return <div data-testid="value">{value}</div>;
}

describe('useStrictContext', () => {
  it('throws when context is null', () => {
    expect(() => render(<Consumer />)).toThrowError('Strict context not passed');
  });

  it('returns value when provided', () => {
    const { getByTestId } = render(
      <Ctx.Provider value={42}>
        <Consumer />
      </Ctx.Provider>
    );
    expect(getByTestId('value').textContent).toBe('42');
  });
});
