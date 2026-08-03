'use client';

import { createContext } from '@re/core/utils/create-context';

const { Provider: ShortsFiltersProvider, useStore: useShortsFilters } = createContext<
  {
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
  },
  {
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
  }
>((v) => v, 'ShortsProvider');

export { ShortsFiltersProvider, useShortsFilters };
