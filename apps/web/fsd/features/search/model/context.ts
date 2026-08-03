import type { Dispatch, SetStateAction } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { useSiteConfig } from '~app/providers/site-config-provider';
import type { HistoryItem } from '~features/search/model/types/search-schema';
import { getSiteConfig } from '~shared/config/site-config';
import { useDebouncedValue } from '~shared/hooks/use-debounced-value';
import { useLocalStorageState } from '~shared/hooks/use-local-storage-state';
import { useSearchState } from '~shared/lib/search/use-search-modal';

import { useSearch } from './queries';

export const { Provider: HistoryProvider, useStore: useSearchHistory } = createContext<
  {
    history: HistoryItem[] | undefined;
    setHistory: Dispatch<SetStateAction<HistoryItem[] | undefined>>;
  },
  {}
>(() => {
  const [history, setHistory] = useLocalStorageState<HistoryItem[]>('search-history', []);
  return { history, setHistory };
});

export interface SearchResultsOptions {
  count: number;
  loadNext: boolean;
}

export const { Provider: SearchResultsProvider, useStore: useSearchResultsStore } = createContext<
  { searchQuery: ReturnType<typeof useSearch>; options: SearchResultsOptions },
  { options: SearchResultsOptions }
>(({ options }) => {
  const { count = 20, loadNext = false } = options;
  const { filters, lookup } = useSearchState();
  const siteConfig = useSiteConfig();
  const [debouncedQuery] = useDebouncedValue(filters.query, 800, { leading: true });

  const searchQuery = useSearch({
    variables: {
      query: {
        count,
        ...filters,
        query: debouncedQuery,
      },
    },
    fetchOptions: {
      // @ts-ignore
      baseUrl:
        lookup && siteConfig.relations?.[lookup]
          ? getSiteConfig(siteConfig.relations[lookup])!.storageUrl
          : '',
    },
  });

  return {
    searchQuery,
    options: {
      count,
      loadNext,
    },
  };
});
