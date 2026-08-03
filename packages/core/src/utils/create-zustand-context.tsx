import { createContext, FC, type ReactNode, useContext } from 'react';

import { useStore as useZustandStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';

import { useCreateZustandStoreRef } from '../hooks/use-create-zustand-store-ref';

export interface ZustandContextOptions<TStore, TProps extends Record<string, any>> {
  displayName?: string;
  hooks?: ((props: { storeApi: TStore } & TProps) => void)[];
}

const DEFAULT_DISPLAY_NAME = 'ZustandStore';

export function createZustandContext<
  TState extends object,
  TProps extends Record<string, any> = {},
  TInitState = Partial<TState>,
  TStore extends StoreApi<TState> = StoreApi<TState>,
>(
  createStore: (initialState?: TInitState, props?: TProps) => TStore,
  opts: string | ZustandContextOptions<TStore, TProps> = {}
) {
  const { hooks } = typeof opts === 'string' ? {} : opts;
  const displayName = typeof opts === 'string' ? opts : (opts.displayName ?? DEFAULT_DISPLAY_NAME);

  const StoreContext = createContext<TStore | null>(null);
  StoreContext.displayName = `${displayName}Context`;

  type InternalProviderProps = {
    children: ReactNode;
    initialState?: TInitState | (() => TInitState);
    createStore?: (initialState?: TInitState, props?: TProps) => TStore;
  };

  type Provider = FC<InternalProviderProps & TProps>;

  const Provider: Provider = (allProps) => {
    const { children, initialState, createStore: createStoreProp, ...props } = allProps;

    const storeApi = useCreateZustandStoreRef(
      createStoreProp || createStore,
      initialState,
      props as unknown as TProps
    );

    for (const useHook of hooks || []) {
      useHook({ storeApi, ...(props as unknown as TProps) });
    }

    return <StoreContext.Provider value={storeApi}>{children}</StoreContext.Provider>;
  };
  Provider.displayName = `${displayName}Provider`;

  function useStore<T>(selector: (state: TState) => T, componentName?: string): T {
    const store = useContext(StoreContext);

    if (!store) {
      throw new Error(
        `use${displayName} must be used within ${displayName}Provider. ${
          componentName ? `The errored call is located in the ${componentName} component.` : ''
        }`
      );
    }

    return useZustandStore(store, selector);
  }

  function useStoreApi(componentName?: string): TStore {
    const store = useContext(StoreContext);

    if (!store) {
      throw new Error(
        `use${displayName} must be used within ${displayName}Provider. ${
          componentName ? `The errored call is located in the ${componentName} component.` : ''
        }`
      );
    }

    return store;
  }

  return {
    Provider,
    useStore,
    useStoreApi,
    StoreContext,
  };
}
