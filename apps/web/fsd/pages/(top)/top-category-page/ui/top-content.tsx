'use client';

import { useTopTitlesSuspenseInfiniteQuery } from '~entities/title/model/queries';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { useTopParams } from '~entities/top/model/hooks';
import { FlatList } from '~shared/ui/flat-list-v2';

export const TopContent = () => {
  const { tab, period } = useTopParams();

  const { data, fetchNextPage, isFetching, hasNextPage } = useTopTitlesSuspenseInfiniteQuery({
    variables: {
      query: { count: 20, period, tag: String(tab) },
    },
  });

  return (
    <FlatList.Root content={data?.pages.map((it) => it.titles).flat()} isLoading={isFetching}>
      <FlatList.Layout layout="list">
        <FlatList.Content>
          {({ item, attributes }) => (
            <HorizontalTitleCard {...attributes} key={item.id} model={item} size="md" />
          )}
        </FlatList.Content>
        <FlatList.Loading count={4}>
          {({ key }) => <HorizontalTitleCard model={{}} isLoading key={key} />}
        </FlatList.Loading>
        <FlatList.EdgeTrigger onTrigger={fetchNextPage} canTrigger={!isFetching && hasNextPage} />
      </FlatList.Layout>

      <FlatList.Empty text="Пусто" emoji="🎴" />
    </FlatList.Root>
  );
};
