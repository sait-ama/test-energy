import { useRef } from 'react';

import { StoreApi } from 'zustand';

export const useCreateZustandStoreRef = <TStore extends StoreApi<unknown>, TInitState, TProps>(
  createStore: (initialState?: TInitState, props?: TProps) => TStore,
  initialState?: TInitState | (() => TInitState),
  props?: TProps
) => {
  const storeRef = useRef<TStore>(null);

  return (storeRef.current ||= createStore(
    initialState && typeof initialState === 'function'
      ? (initialState as () => TInitState)()
      : (initialState as TInitState),
    props
  ));
};
