import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StoreApi } from 'zustand/vanilla';

import { createZustandContext } from './create-zustand-context';

type State = { count: number };
const createStore = (init?: Partial<State>) =>
  ({
    getState: () => ({ count: init?.count ?? 0 }),
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  }) as unknown as StoreApi<State>;

describe('createZustandContext', () => {
  const { Provider, useStore, useStoreApi } = createZustandContext<State>(createStore, 'Test');

  it('throws if useStore called outside Provider', () => {
    expect(() => useStore((s) => s.count)).toThrow();
  });

  it('provides store and selector works', () => {
    function Comp() {
      const count = useStore((s) => s.count);
      return <span data-testid="count">{count}</span>;
    }
    render(
      <Provider>
        <Comp />
      </Provider>
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('provides store api', () => {
    function Comp() {
      const api = useStoreApi();
      return <span data-testid="api">{typeof api.getState === 'function' ? 'ok' : 'fail'}</span>;
    }
    render(
      <Provider>
        <Comp />
      </Provider>
    );
    expect(screen.getByTestId('api').textContent).toBe('ok');
  });

  it('calls hooks from options', () => {
    const hook = vi.fn();
    const { Provider: P } = createZustandContext<State>(createStore, {
      hooks: [hook],
      displayName: 'Test2',
    });
    render(
      <P>
        <span>child</span>
      </P>
    );
    expect(hook).toHaveBeenCalled();
  });
});
