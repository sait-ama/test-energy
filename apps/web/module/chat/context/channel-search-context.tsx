import React from 'react';

import { createContext } from '@re/core/utils/create-context';

export type ChannelSearchContextValue = {
  /**
   * Input reference
   */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /**
   * Current search query (immediate input value)
   */
  isSearchOpen: boolean;
  /**
   * Set is search open
   */
  setIsSearchOpen: (isSearchOpen: boolean) => void;
  /**
   * Search query
   */
  searchQuery: string;
  /**
   * Set search query
   */
  setSearchQuery: (query: string) => void;
  /**
   * Clear search query and results
   */
  clearSearch: () => void;
};

export const {
  useStore: useChannelSearchContext,
  Provider: ChannelSearchProvider,
  Context: ChannelSearchContext,
} = createContext<ChannelSearchContextValue, ChannelSearchContextValue>(
  (v) => v,
  'ChannelSearchContext'
);
