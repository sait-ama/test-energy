import { useMemo } from 'react';

import { useTitleFiltersStore } from '../model/context';

const DEFAULT_IGNORE = ['ordering'];

export const useCountActiveFilters = (ignore: string[] = DEFAULT_IGNORE) => {
  const activeFilters = useTitleFiltersStore((v) => v.activeFilters);
  const schema = useTitleFiltersStore((v) => v.schema);

  const countFilters = useMemo(
    () =>
      Object.keys(activeFilters).filter((v) => Object.hasOwn(schema, v) && !ignore.includes(v))
        .length,
    [activeFilters, ignore, schema]
  );

  return countFilters;
};
