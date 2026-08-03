'use client';
import React, { ReactNode, useMemo } from 'react';

import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { UserTopResults } from '@re/api/generated/types.gen';
import type { UseSuspenseInfiniteQueryOptions } from '@tanstack/react-query';
import { InfiniteData } from '@tanstack/react-query';

import { Routing } from '~shared/config/routing';
import { MinimalPaginationResponse, ResponseResults } from '~shared/types/buisines';
import { FlatList as _FlatList, FlatListType } from '~shared/ui/flat-list-v2';
import {
  InternalEntity,
  ListItem,
  ListItemSkeleton,
  ListTopContentRoot,
  ListTopRoot,
  ListTopThreeRoot,
  TopItem,
} from '~shared/ui/item-top';

interface UserTopItemProps<
  TData extends MinimalPaginationResponse & ResponseResults<UserTopResults>,
  TError = Error,
> {
  queryOptions: UseSuspenseInfiniteQueryOptions<TData, TError, InfiniteData<TData>>;
  slot?: ReactNode;
  orderingField: string;
  icon?: ReactNode;
  withPagination?: boolean;
}

export const UserTopItem = <
  TData extends MinimalPaginationResponse & ResponseResults<UserTopResults>,
  TError = Error,
>(
  props: UserTopItemProps<TData, TError>
) => {
  const { withPagination = true, queryOptions, slot, orderingField, icon = null } = props;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useApiGenSuspenseInfiniteQuery(queryOptions);

  const items = useMemo(
    () =>
      data?.pages
        .flatMap((p) => p.results)
        .map((it) => ({
          id: it.id,
          title: it.username,
          imgSource: it.avatar?.high ?? '',
          icon,
          count: it[orderingField as keyof UserTopResults] || 0,
          href: Routing.User.detail({ params: { id: it.id, tab: 'about' } }),
        })) || [],
    [data]
  );

  const FlatList: FlatListType<InternalEntity[]> = _FlatList;
  const topItemsPositions = [1, 0, 2] as const;

  return (
    <ListTopRoot className="relative">
      <ListTopThreeRoot>
        {topItemsPositions.map(
          (pos) =>
            items[pos] && (
              <TopItem
                key={pos}
                entity={items[pos]}
                place={(pos + 1) as 1 | 2 | 3}
                justify={pos ? 'end' : 'start'}
              />
            )
        )}
      </ListTopThreeRoot>
      <FlatList.Root
        className="z-[100]"
        content={items.slice(3)}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      >
        <ListTopContentRoot>
          <FlatList.Content>
            {({ item, index }) => <ListItem key={item.id} model={item} index={index + 4} />}
          </FlatList.Content>
          <FlatList.Loading count={10}>
            {({ key }) => <ListItemSkeleton key={key} />}
          </FlatList.Loading>
          <FlatList.EdgeTrigger
            canTrigger={!isFetchingNextPage && withPagination && hasNextPage}
            onTrigger={fetchNextPage}
          />
          <FlatList.Empty />
        </ListTopContentRoot>
      </FlatList.Root>
      {slot}
    </ListTopRoot>
  );
};
