'use client';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useUserSubscriptionsPaginatedListQuery } from '~entities/user-subscriptions/model/queries';
import { FollowersOrdering } from '~entities/user-subscriptions/ui/ordering';
import { SubscriptionCardFabricWithAction } from '~features/author-unsubscribe/ui/subscription-card-fabric';
import { ErrorBase } from '~features/error-view/ui/error-base';
import type { SubContentType } from '~shared/api/models/user-subscriptions';
import { useQueryPrimitiveParams } from '~shared/hooks/use-query-params';
import { FlatList as _FlatList, FlatListType } from '~shared/ui/flat-list-v2';
import { RouterMenuTabs } from '~shared/ui/router-menu/ui/router-menu-tabs';

const sortVariants = [
  { label: 'Посты юзеров', value: 'author_users' },
  { label: 'Посты команд', value: 'author_publishers' },
  { label: 'Тайтлы команды', value: 'titles_publishers' },
  { label: 'Карты тайтлов', value: 'title_cards' },
] satisfies { label: string; value: SubContentType }[];

export const SubscriptionList = () => {
  const { value: subType } = useQueryPrimitiveParams<SubContentType>({
    defaultValue: 'author_users',
    fieldName: 'sub_type',
  });
  const {
    data: pages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useUserSubscriptionsPaginatedListQuery();

  const subscriptions = pages?.pages.flatMap((page) => page.results) || [];
  const FlatList: FlatListType<typeof subscriptions> = _FlatList;

  return (
    <div className="cs-subscriptions-section cs-section flex flex-col gap-4">
      <span className="flex flex-wrap items-center justify-between gap-2">
        <RouterMenuTabs
          className="flex justify-between gap-2 border-0 md:justify-start"
          size="xs"
          defaultValue="author_users"
          fieldName="sub_type"
          options={sortVariants}
        />
        <FollowersOrdering />
      </span>

      <ErrorBoundary
        fallbackRender={(props) => (
          <div className="border-border bg-background flex items-center justify-center rounded-sm border p-4">
            <ErrorBase
              status={props.error?.status}
              text={props.error?.detail?.message ?? 'Что-то сломалось...'}
            />
          </div>
        )}
      >
        <FlatList.Root className="" content={subscriptions} isLoading={isLoading}>
          <FlatList.Container
            layout="grid"
            className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6"
          >
            <FlatList.Content>
              {({ item, index }) => (
                <SubscriptionCardFabricWithAction
                  key={index}
                  className="cs-subscription-item"
                  subType={subType!}
                  subscribtion={item}
                />
              )}
            </FlatList.Content>
            <FlatList.Empty text="Пусто" emoji="🎴" />
            <FlatList.EdgeTrigger
              canTrigger={!isFetchingNextPage && !isFetching && hasNextPage}
              onTrigger={fetchNextPage}
            />
          </FlatList.Container>
        </FlatList.Root>
      </ErrorBoundary>
    </div>
  );
};
