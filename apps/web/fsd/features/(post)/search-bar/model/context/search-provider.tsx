'use client';
import type { ReactNode } from 'react';
import { createContext } from 'react';

import { useQueryState } from '~shared/hooks/use-query-state';
import { noop } from '~shared/utils/noop';

import type { State } from '../types/state';

const defState = ['', noop] as State;
export const SearchContext = createContext<State>(defState);
export const TabContext = createContext<State>(defState);
const DEFAULT_TAB = 'titles';
export const useQueryStateState = (init?: string) =>
  useQueryState({ key: 'query', initialValue: init });
const useSearchQueryStateState = () => useQueryState({ key: 'search', initialValue: '' });

export const useFieldState = () => useQueryState({ key: 'field', initialValue: DEFAULT_TAB });
export const SearchContextProvider = ({
  children,
  init,
}: {
  children: ReactNode;
  init: string;
}) => {
  const queryStore = useQueryStateState(init);
  const tabStore = useFieldState();
  return (
    <SearchContext.Provider value={queryStore}>
      <TabContext.Provider value={tabStore}>{children}</TabContext.Provider>
    </SearchContext.Provider>
  );
};
export const SearchPostContextProvider = ({ children }: { children: ReactNode }) => {
  const store = useSearchQueryStateState();
  return <SearchContext.Provider value={store}>{children}</SearchContext.Provider>;
};
