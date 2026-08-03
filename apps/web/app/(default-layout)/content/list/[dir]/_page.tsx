'use client';

import { useParams } from 'next/navigation';

import { useTitleSliderContentSuspenseInfiniteQuery } from '~entities/title/model/queries';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { FlatList } from '~shared/ui/flat-list-v2';

export const TitlesSliderPage = () => {
  const { dir } = useParams<{ dir: string }>();
  const { data, fetchNextPage, isFetching, hasNextPage } =
    useTitleSliderContentSuspenseInfiniteQuery(
      {
        variables: {
          params: { dir },
          query: { count: 20 },
        },
      },
      { throwOnError: true }
    );

  return (
    <FlatList.Root
      content={data?.pages.map((it) => it.titles).flat()}
      isLoading={isFetching}
      className="mx-2"
    >
      <FlatList.Layout layout="list">
        <FlatList.Content>
          {({ item, attributes }) => (
            <HorizontalTitleCard {...attributes} key={item.title.id} model={item.title} />
          )}
        </FlatList.Content>
        <FlatList.Loading count={4}>
          {({ key }) => <HorizontalTitleCard model={null} isLoading key={key} />}
        </FlatList.Loading>
        <FlatList.EdgeTrigger onTrigger={fetchNextPage} canTrigger={!isFetching && hasNextPage} />
      </FlatList.Layout>

      <FlatList.Empty text="Пусто" emoji="🎴" />
    </FlatList.Root>
  );
};
