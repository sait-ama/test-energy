import * as React from 'react';
import { ComponentType, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';

import { getV2NextPageParam, useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import {
  v2InventoryCollectionsRetrieve2InfiniteOptions,
  v2InventoryRareCollectionsRetrieveInfiniteOptions,
  v2TitlesCollectionsListInfiniteOptions,
} from '@re/api/generated/@tanstack/react-query.gen';
import { removeUnusedQueryParams } from '@re/core/lib/query-params';
import { useTranslations } from 'use-intl';

import { DEFAULT_INITIAL_PAGE, DEFAULT_PAGE_SIZE } from '~entities/card-collections/model/const';
import { CollectionType } from '~entities/card-collections/model/queries';
import { ItemSkeleton } from '~entities/card-collections/ui/item-skeleton';
import { CollectionCard, CollectionCardSkeleton } from '~entities/collection/ui/collection-card';
import { CollectionInListActions } from '~features/(collections)/ui/list/collection-in-list-actions';
import { useCollectionCardType } from '~pages/(user)/inventory-tab/ui/collection-cards-tab/model/state';
import { client } from '~shared/api/client';
import { Ordering } from '~shared/api/models/ordering';
import { EmptyView } from '~shared/ui/empty-view';
import {
  FlatList as _FlatList,
  type FlatListContentProps,
  FlatListItemRenderer,
  FlatListLoadingProps,
  FlatListType,
} from '~shared/ui/flat-list-v2';
import { deduplicate } from '~shared/utils/record-deduplicator';
import { RareCardCollection } from '~widgets/card-collections/ui/rare-card-collection';
import { UserCardCollectionCard } from '~widgets/card-collections/ui/user-card-collection';

type ListProps<T extends { id: number }> = {
  isEmpty?: boolean;
  collections: T[];
  isFetching?: boolean;
  isLoading?: boolean;
  Skeleton: ComponentType;
  children: FlatListItemRenderer<T>;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage: () => Promise<unknown>;
};

const List = <T extends { id: number }>({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  collections,
  Skeleton,
  isFetching,
  isLoading,
  children,
}: ListProps<T>) => {
  const FlatList: FlatListType<typeof collections> = _FlatList;
  const renderSkeleton: FlatListLoadingProps['children'] = ({ key }) => {
    return <Skeleton key={key} />;
  };
  const t = useTranslations('reusable.empty_states');

  return (
    <FlatList.Root isLoading={isLoading} content={collections}>
      <FlatList.Container className="flex flex-col gap-4">
        <FlatList.Content>{children}</FlatList.Content>
        <FlatList.Loading count={DEFAULT_PAGE_SIZE * 2}>{renderSkeleton}</FlatList.Loading>
        <FlatList.EdgeTrigger
          position="bottom"
          onTrigger={fetchNextPage}
          canTrigger={hasNextPage && !isFetchingNextPage && !isLoading && !isFetching}
        />
        <FlatList.Empty text={t('empty')} emoji="🎴" />
      </FlatList.Container>
    </FlatList.Root>
  );
};

const CollectionRareCards = () => {
  const user_id = +useParams<{ id: string }>()?.id;
  const options = v2InventoryRareCollectionsRetrieveInfiniteOptions({
    client,
    path: { user_id },
    query: { count: DEFAULT_PAGE_SIZE, page: DEFAULT_INITIAL_PAGE, ordering: '-percent' },
  });
  const t = useTranslations('reusable.empty_states');

  const queryData = useApiGenSuspenseInfiniteQuery({
    ...options,
    initialPageParam: 1,
    getNextPageParam: getV2NextPageParam,
  });

  const { pages = [] } = queryData?.data ?? {};
  const collections = useMemo(
    () =>
      deduplicate(
        pages.flatMap((v) => v.results),
        (v) => v.id
      ),
    [pages]
  );
  const isEmpty = !queryData?.isFetching && !collections.length;

  return (
    <EmptyView
      text={t('empty')}
      emoji="🎴"
      isEmpty={isEmpty}
      className="border-border h-[40vh] border"
    >
      <List Skeleton={ItemSkeleton} collections={collections} {...queryData}>
        {({ item, attributes }) => (
          <RareCardCollection key={item.id} {...attributes} model={item} />
        )}
      </List>
    </EmptyView>
  );
};

const CollectionCardsUser = () => {
  const userId = +useParams<{ id: string }>()?.id;
  const options = v2InventoryCollectionsRetrieve2InfiniteOptions({
    client,
    path: { user_id: userId },
    query: {
      count: DEFAULT_PAGE_SIZE,
      page: DEFAULT_INITIAL_PAGE,
      ordering: `-${Ordering.TIME}`,
    },
  });

  const queryData = useApiGenSuspenseInfiniteQuery({
    ...options,
    initialPageParam: 1,
    getNextPageParam: getV2NextPageParam,
  });

  const { pages = [] } = queryData?.data ?? {};
  const collections = useMemo(
    () =>
      deduplicate(
        pages.flatMap((v) => v.results),
        (v) => v.id
      ),
    [pages]
  );
  const isEmpty = !queryData?.isFetching && !collections.length;
  const t = useTranslations('reusable.empty_states');

  return (
    <EmptyView text={t('empty')} emoji="🎴" isEmpty={isEmpty} className="h-[40vh]">
      <List Skeleton={ItemSkeleton} collections={collections} {...queryData}>
        {({ item, attributes }) => (
          <UserCardCollectionCard key={item.id} model={item} heroAttr={attributes} />
        )}
      </List>
    </EmptyView>
  );
};

const CollectionTitles = () => {
  const userId = +useParams<{ id: string }>()?.id;
  const t = useTranslations('reusable.empty_states');

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
        user_id: String(userId),
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
          containerClassName="bg-card"
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
      isLoading={isFetchingNextPage || isFetching}
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

export const CollectionsCardsTab = () => {
  const [type] = useCollectionCardType();

  if (type === CollectionType.USER) return <CollectionCardsUser />;

  if (type === CollectionType.TITLE) return <CollectionTitles />;

  if (type === CollectionType.EXCHANGEABLE) return <CollectionRareCards />;

  return null;
};
