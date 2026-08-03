import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createContextSelector } from './create-context-selector';

type Ctx = { value: number };
const createStore = (v: number) => ({ value: v });

describe('createContextSelector', () => {
  const { Provider, useStore, Consumer } = createContextSelector<Ctx, number>(createStore, 'Test');

  it('returns value from context', () => {
    function Comp() {
      const ctx = useStore();
      return <span data-testid="val">{ctx.value}</span>;
    }
    render(
      <Provider value={42}>
        <Comp />
      </Provider>
    );
    expect(screen.getByTestId('val').textContent).toBe('42');
  });

  it('returns selected value', () => {
    function Comp() {
      const v = useStore((ctx) => ctx.value);
      return <span data-testid="val">{v}</span>;
    }
    render(
      <Provider value={7}>
        <Comp />
      </Provider>
    );
    expect(screen.getByTestId('val').textContent).toBe('7');
  });

  it('Consumer provides context value', () => {
    render(
      <Provider value={5}>
        <Consumer>{(ctx) => <span data-testid="val">{ctx.value}</span>}</Consumer>
      </Provider>
    );
    expect(screen.getByTestId('val').textContent).toBe('5');
  });
});
