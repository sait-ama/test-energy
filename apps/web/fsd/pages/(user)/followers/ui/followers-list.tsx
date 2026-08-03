'use client';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useFollowersPaginatedListQuery } from '~entities/user-subscriptions/model/queries';
import { FollowerCard } from '~entities/user-subscriptions/ui/follower-card';
import { ErrorView } from '~features/error-view';
import type {
  FollowerSchema,
  FollowersPaginatedListResponseSchema,
} from '~shared/api/models/follower';
import type { SubContentType } from '~shared/api/models/user-subscriptions';
import { FlatList as _FlatList, type FlatListType } from '~shared/ui/flat-list-v2';

const Followers = ({
  initialData,
  itemClassName,
  sub_type,
}: {
  itemClassName?: string;
  initialData?: FollowersPaginatedListResponseSchema;
  sub_type: SubContentType;
}) => {
  const {
    data: pages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isPlaceholderData,
  } = useFollowersPaginatedListQuery('author_users', initialData);
  const followers = pages?.pages.flatMap((page) => page.results) || [];

  const FlatList: FlatListType<typeof followers> = _FlatList;

  return (
    <FlatList.Root
      content={followers}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    >
      <FlatList.Layout layout="grid">
        <FlatList.Content>
          {({ item }) => (
            <FollowerCard
              isLoading={isPlaceholderData}
              className={itemClassName}
              subType={sub_type}
              model={item}
              key={item.id}
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={20}>
          {({ key }) => (
            <FollowerCard
              isLoading
              className={itemClassName}
              subType={sub_type}
              model={{} as FollowerSchema}
              key={key}
            />
          )}
        </FlatList.Loading>
        <FlatList.Empty text="Пусто" emoji="ඞ" />
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={!isFetchingNextPage && hasNextPage}
        />
      </FlatList.Layout>
    </FlatList.Root>
  );
};
export const FollowersList = ({
  initialData,
  itemClassName,
  subType,
}: {
  itemClassName?: string;
  initialData: FollowersPaginatedListResponseSchema;
  subType: SubContentType;
}) => (
  <ErrorBoundary fallback={<ErrorView />}>
    <Followers sub_type={subType} itemClassName={itemClassName} initialData={initialData} />
  </ErrorBoundary>
);
