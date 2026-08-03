'use client';
import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useIsFirstRender } from '@artsy/fresnel/dist/Utils';

import { getV2NextPageParam, useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { removeUnusedQueryParams } from '@re/core/lib/query-params';

import { CollectionCard, CollectionCardSkeleton } from '~entities/collection/ui/collection-card';
import { CollectionInListActions } from '~features/(collections)/ui/list/collection-in-list-actions';
import { client } from '~shared/api/client';
import { v2TitlesCollectionsListInfiniteOptions } from '~shared/api/generated/tanstack';
import type {
  FlatListContentProps,
  FlatListLoadingProps,
  FlatListType,
} from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { deduplicate } from '~shared/utils/record-deduplicator';

export const CollectionsList = () => {
  const t = useTranslations('reusable.empty_states');

  const searchParams = useSearchParams();
  const user_id = (searchParams?.get?.('user_id') || undefined) as number | undefined;
  const title_id = (searchParams?.get?.('title_id') || undefined) as number | undefined;
  const isFirst = useIsFirstRender();

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useApiGenSuspenseInfiniteQuery({
    ...v2TitlesCollectionsListInfiniteOptions({
      client,
      query: removeUnusedQueryParams({
        user_id: +user_id!,
        title_id: +title_id!,
        count: 20,
        page: 1,
      }),
      cache: 'force-cache',
      next: { revalidate: 60 * 60 * 4 },
    }),
    initialPageParam: 1,
    getNextPageParam: getV2NextPageParam,
  });

  const collections = deduplicate(
    pages.flatMap((v) => v.results),
    (v) => v.id
  );
  const FlatList: FlatListType<typeof collections> = _FlatList;

  const renderContent: FlatListContentProps<typeof collections>['children'] = useCallback(
    ({ item }) => {
      return (
        <CollectionCard
          withDescription
          actions={<CollectionInListActions key={item.id} collection={item} />}
          model={item}
          key={item.id}
        />
      );
    },
    []
  );

  const renderSkeletons: FlatListLoadingProps['children'] = useCallback(({ key }) => {
    return <CollectionCardSkeleton key={key} />;
  }, []);

  return (
    <FlatList.Root
      content={collections}
      isLoading={isFetchingNextPage || (isFetching && !isFirst)}
      className="xs:grid-cols-2 grid w-full grid-cols-2 gap-4 max-sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
    >
      <FlatList.Content>{renderContent}</FlatList.Content>
      <FlatList.EdgeTrigger
        onTrigger={fetchNextPage}
        canTrigger={hasNextPage && !isFetchingNextPage}
      />
      <FlatList.Loading count={10}>{renderSkeletons}</FlatList.Loading>
      <FlatList.Empty className="col-span-full m-auto" text={t('empty')} emoji="🎴" />
    </FlatList.Root>
  );
};
