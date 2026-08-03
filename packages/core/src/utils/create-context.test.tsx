import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createContext } from './create-context';

type Ctx = { value: number };
const createStore = (v: number) => ({ value: v });

describe('createContext', () => {
  const { Provider, useStore, Consumer } = createContext<Ctx, number>(createStore, 'Test');

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

  it('returns undefined and warns if outside Provider', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    function Comp() {
      // @ts-expect-error
      return <span>{useStore()}</span>;
    }
    render(<Comp />);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
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
