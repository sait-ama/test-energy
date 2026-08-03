'use client';
import { useMemo } from 'react';

import { getV2NextPageParam, useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { ReText } from '@re/ui-kit/ui/text';

import { getClubsInfiniteListOptions } from '~entities/guild/api/queries';
import { client } from '~shared/api/client';
import { Routing } from '~shared/config/routing';
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

const GuildTop = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useApiGenSuspenseInfiniteQuery({
    ...getClubsInfiniteListOptions({
      client,
      query: { ordering: 'rank' },
    }),
    getNextPageParam: getV2NextPageParam,
    initialPageParam: 1,
  });

  const items = useMemo(
    () =>
      data?.pages
        .flatMap((it) => it.results)
        .map((it) => ({
          id: it.id,
          title: it.name,
          imgSource: it.avatar?.high ?? '',
          count: it.exp,
          icon: <span>⚡️</span>,
          footer: <span className="text-warning font-semibold">lvl {it.cur_level}</span>,
          href: Routing.Club.clubByDir({ params: { dir: it.dir, tab: 'about' } }),
        })) || [],
    [data]
  );

  const FlatList: FlatListType<InternalEntity[]> = _FlatList;

  return (
    <ListTopRoot>
      <ListTopThreeRoot>
        {items[1] && <TopItem entity={items[1]} place={2} justify="end" />}
        {items[0] && <TopItem entity={items[0]} place={1} justify="start" />}
        {items[2] && <TopItem entity={items[2]} place={3} justify="end" />}
      </ListTopThreeRoot>
      <FlatList.Root
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
            canTrigger={!isFetchingNextPage && hasNextPage}
            onTrigger={fetchNextPage}
          />
          <FlatList.Empty />
        </ListTopContentRoot>
      </FlatList.Root>
    </ListTopRoot>
  );
};

export const GuildTopPage = () => {
  return (
    <div className="flex flex-col gap-8 md:gap-16">
      <ReText className="self-center select-none" size="3xl" weight="bold">
        Топы гильдий
      </ReText>
      <GuildTop />
    </div>
  );
};
