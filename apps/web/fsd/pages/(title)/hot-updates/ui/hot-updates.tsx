'use client';
import { useTitlesListSuspenseInfiniteQuery } from '~entities/title/model/queries';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { withQuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { FlatList } from '~shared/ui/flat-list-v2';

export const HotUpdates = withQuerySuspenseContainer(
  function HotUpdatesContent() {
    const { data, fetchNextPage, isFetching, hasNextPage } = useTitlesListSuspenseInfiniteQuery({
      variables: {
        query: { count: 20, slider: 'hot_new' },
      },
    });

    return (
      <FlatList.Root
        content={data?.pages.map((it) => it.titles).flat()}
        isLoading={isFetching}
        className="mx-2 grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        <FlatList.Content>
          {({ item, attributes }) => (
            <HorizontalTitleCard {...attributes} key={item.id} model={item} rating={item.rated} />
          )}
        </FlatList.Content>
        <FlatList.Loading count={4}>
          {({ key }) => <HorizontalTitleCard model={null} isLoading key={key} />}
        </FlatList.Loading>
        <FlatList.EdgeTrigger onTrigger={fetchNextPage} canTrigger={!isFetching && hasNextPage} />

        <FlatList.Empty text="Пусто" emoji="🎴" />
      </FlatList.Root>
    );
  },
  <div className="mx-2 grid grid-cols-1 gap-3 md:grid-cols-2">
    {Array(8)
      .fill(0)
      .map((_, i) => (
        <HorizontalTitleCard model={null} isLoading key={`l_${i}`} />
      ))}
  </div>
);
