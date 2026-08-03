'use client';

import { createContext } from '@re/core/utils/create-context';
import { create } from 'zustand';

import type { SearchTab } from '~features/search/model/consts';
import type { SearchItem } from '~shared/api/models/search';
import { SearchField } from '~shared/api/models/search';
import type { ContentTypes } from '~shared/config/constants';

export interface Filters {
  query: string;
  field: SearchField;
}

export interface SearchState {
  filters: Filters;
  fields: SearchTab[];
  setFilters: (filters: Filters) => void;
  onClick?: (element: SearchItem<SearchField>, filters: Filters) => void;
  lookup?: ContentTypes;
}

export const {
  Provider: SearchStateProvider,
  useStore: useSearchState,
  Consumer: SearchStateConsumer,
} = createContext<SearchState, SearchState>((v) => v);

export enum PaginationMode {
  REDIRECT = 'redirect',
  LOAD_MORE = 'load-more',
}

export interface State {
  isOpen: boolean;
  asDiv?: boolean;
  open: (options?: Options) => void;
  close: () => void;
  hits?: boolean;
  history?: boolean;
  fields?: SearchField[];
  lookup?: ContentTypes;
  onClick?: <T extends SearchField>(element: SearchItem<T>, filters: Filters) => void;
  paginationMode?: PaginationMode;
}

export type Options = Omit<State, 'isOpen' | 'open' | 'close'>;

const defaultValues: Options = {
  hits: true,
  history: true,
  paginationMode: PaginationMode.REDIRECT,
  fields: [
    SearchField.titles,
    SearchField.publishers,
    SearchField.characters,
    SearchField.creators,
    SearchField.users,
    SearchField.cards,
  ],
};

export const useSearchModal = create<State>((set) => ({
  isOpen: false,
  open: (options) => {
    set((prev) => ({ ...prev, ...defaultValues, ...options, isOpen: true }));
  },
  close: () => {
    set((prev) => ({ ...prev, isOpen: false }));
  },
  ...defaultValues,
}));
