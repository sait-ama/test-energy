import { type FC, type ReactNode } from 'react';

import type { Context } from 'use-context-selector';
import { createContext as createReactContext, useContextSelector } from 'use-context-selector';

interface ProviderProps<Value> {
  children: ReactNode;
  value?: Value;
}

/**
 * @deprecated
 */
export const createContextSelector = <ContextValue, Value>(
  createStore: (options: Value) => ContextValue,
  displayName?: string
) => {
  const ReactContext = createReactContext<ContextValue | null>(null);

  const Provider: FC<ProviderProps<Value>> = ({ children, value }) => {
    'use no memo';
    const store = createStore(value!);

    // Using type assertion to bypass type incompatibilities
    const ContextProvider = ReactContext.Provider as any;
    return <ContextProvider value={store}>{children}</ContextProvider>;
  };

  Provider.displayName = `${displayName}Provider`;

  const Consumer: FC<{ children: (value: ContextValue) => ReactNode }> = (props) => {
    'use no memo';
    const { children } = props;
    const value = useContextSelector(ReactContext, (v) => v);

    return children(value!);
  };

  Consumer.displayName = `${displayName}Consumer`;

  const useStore = <Selected = ContextValue,>(
    selector: (value: ContextValue) => Selected = (v) => v as unknown as Selected
  ): Selected =>
    useContextSelector<ContextValue, Selected>(ReactContext as Context<ContextValue>, selector);
  return {
    useStore,
    Provider,
    Consumer,
    Context: ReactContext,
  };
};
