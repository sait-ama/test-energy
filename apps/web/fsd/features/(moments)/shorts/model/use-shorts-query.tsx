import { useMemo } from 'react';

import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import type { V2TitlesMomentsCatalogListData } from '@re/api/generated/types.gen';

import { reV2TitlesMomentsCatalogListInfiniteOptions } from '~entities/moment/model/queries';
import { deduplicate } from '~shared/utils/record-deduplicator';

const COUNT = 20;

export const useShortsQuery = ({
  filters,
}: {
  filters?: V2TitlesMomentsCatalogListData['query'];
}) => {
  const query = useApiGenSuspenseInfiniteQuery(
    reV2TitlesMomentsCatalogListInfiniteOptions({
      api: {
        query: { count: COUNT, ...filters },
      },
    })
  );

  const memoizedMoments = useMemo(
    () => deduplicate(query.data?.pages?.flatMap((it) => it.results) ?? [], (it) => it.id),
    [query.data]
  );

  return {
    ...query,
    data: memoizedMoments,
  };
};
