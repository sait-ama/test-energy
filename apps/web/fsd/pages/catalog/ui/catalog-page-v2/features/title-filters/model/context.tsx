'use client';

import { createFiltersContext, useUrlSync } from '~shared/lib/filters';
import { useUpdateFilterSchema } from '~shared/lib/filters/model/middlewares';

import { TitleFiltersSchema } from './schema';

const {
  Provider: TitleFiltersProvider,
  useStore: useTitleFiltersStore,
  useStoreApi: useTitleFiltersStoreApi,
  useFilterField: useTitleFiltersField,
} = createFiltersContext<TitleFiltersSchema>({
  hooks: [useUrlSync, useUpdateFilterSchema],
  displayName: 'TitleFilters',
});

export {
  TitleFiltersProvider,
  useTitleFiltersField,
  useTitleFiltersStore,
  useTitleFiltersStoreApi,
};
