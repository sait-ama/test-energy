import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';

import { DeckCard } from '~entities/shop/ui/deck';
import { client } from '~shared/api/client';
import { v2InventoryDecksRetrieveInfiniteOptions } from '~shared/api/generated/tanstack';
import { Routing } from '~shared/config/routing';
import { defaultNextParam } from '~shared/lib/react-query/default-next-param';
import { FlatList as _FlatList, type FlatListType } from '~shared/ui/flat-list-v2';

export const DecksTab = () => {
  const params = useParams<{ id: string }>();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useApiGenSuspenseInfiniteQuery({
      ...v2InventoryDecksRetrieveInfiniteOptions({
        client,
        query: {
          is_opened: false,
          user_id: parseInt(params.id),
        },
      }),
      getNextPageParam: defaultNextParam,
      initialPageParam: 1,
    });

  const decks = data?.pages.flatMap((page) => page.results) || [];
  const FlatList: FlatListType<typeof decks> = _FlatList;

  return (
    <FlatList.Root
      content={decks}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    >
      <FlatList.Container className="xxs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <FlatList.Content>
          {({ item }) => (
            <Link
              prefetch={false}
              shallow={false}
              href={Routing.Deck.open({ params: { id: item.deck.id } })}
            >
              <DeckCard model={item.deck} key={item.id} />
            </Link>
          )}
        </FlatList.Content>
        <FlatList.Empty text="Пусто" emoji="🎴" />
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={!isFetchingNextPage && hasNextPage}
        />
      </FlatList.Container>
    </FlatList.Root>
  );
};
