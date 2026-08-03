import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import { InfiniteData } from '@tanstack/query-core';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useShopDecksPaginatedListSuspenseQuery } from '~entities/shop/model/queries';
import { ShopQueryKeys } from '~entities/shop/model/query-keys';
import { client } from '~shared/api/client';
import { v2InventoryDecksRetrieveInfiniteOptions } from '~shared/api/generated/tanstack';
import { DeckSchema, DecksListPaginatedListResponseSchema } from '~shared/api/models/shop';
import { getQueryClient } from '~shared/api/react-query';
import { defaultNextParam } from '~shared/lib/react-query/default-next-param';
import { useSession } from '~shared/lib/session/use-session';
import { getServerDataWithTz } from '~shared/utils/get-client-date';

export const useAvailableDecks = () => {
  const { id: deckId } = useParams<{ id: string }>();
  const session = useSession()!;
  const deckQuery = useInfiniteQuery({
    getNextPageParam: defaultNextParam,
    initialPageParam: 1,
    ...v2InventoryDecksRetrieveInfiniteOptions({
      client,
      query: {
        is_opened: false,
        user_id: session.id,
        deck_id: deckId,
      },
      enabled: !!session,
    }),
  });

  const decks = useMemo(
    () => deckQuery.data?.pages?.flatMap((request) => request.results) || [],
    [deckQuery.data]
  );
  const count = useMemo(() => deckQuery.data?.pages?.[0]?.count || 0, [deckQuery.data]);

  return {
    ...deckQuery,
    data: decks,
    count,
  };
};
//todo
export const changeDeckShopItemLocally = (
  deck_id: number,
  mutator: (deck: DeckSchema) => Partial<DeckSchema>
) => {
  const queryClient = getQueryClient();
  queryClient.setQueriesData<InfiniteData<DecksListPaginatedListResponseSchema>>(
    {
      queryKey: ShopQueryKeys.Deck.list({ query: { deck_id: Number(deck_id) } }),
      fetchStatus: 'idle',
    },
    (data) => {
      if (!data) return data;
      return {
        ...data,
        pages: data.pages.map((page) => {
          return {
            ...page,
            results: page.results.map((deck) =>
              deck.id === deck_id || deck.deck.id === deck_id ? { ...deck, ...mutator(deck) } : deck
            ),
          };
        }),
      };
    }
  );
};
export const useChangeDeckShopItem = (mutator: (deck: DeckSchema) => Partial<DeckSchema>) => {
  const { id: deckId } = useParams<{ id: string }>();
  return () => {
    changeDeckShopItemLocally(Number(deckId), mutator);
  };
};
export const useDeckShopItem = () => {
  const { id: deckId } = useParams<{ id: string }>();
  const deckQuery = useShopDecksPaginatedListSuspenseQuery(
    {
      variables: { query: { deck_id: Number(deckId) } },
    },
    {
      // оно само внутри оптимизировано
      select: (v) => {
        for (const page of v.pages) {
          for (const res of page.results) {
            res.availability_start_date = !res.availability_start_date
              ? res.availability_start_date
              : getServerDataWithTz(res.availability_start_date);
            res.availability_end_date = !res.availability_end_date
              ? res.availability_end_date
              : getServerDataWithTz(res.availability_end_date);
          }
        }
        return v;
      },
    }
  );
  const deck = useMemo(
    () => deckQuery.data?.pages?.flatMap((request) => request.results)?.[0] || null,
    [deckQuery.data]
  );
  return {
    ...deckQuery,
    data: deck,
  };
};
