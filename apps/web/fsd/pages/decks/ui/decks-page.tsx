'use client';

import { ComponentProps } from 'react';
import Link from 'next/link';

import { cn } from '@re/ui-kit/utils/cn';

import { useShopDecksPaginatedListSuspenseQuery } from '~entities/shop/model/queries';
import { getItemStatus } from '~entities/shop/model/utils';
import {
  ShopFeedItemTime,
  ShopFeedItemTimerDepsProvider,
  ShopFeedTimerDepsStore,
  useShopItemByDateStatus,
} from '~entities/shop/ui/dates';
import { DeckCard } from '~entities/shop/ui/deck';
import { changeDeckShopItemLocally } from '~pages/deck-open/model/queries';
import type { DeckSchema } from '~shared/api/models/shop';
import { Routing } from '~shared/config/routing';
import { useTourItem } from '~shared/lib/tour/items';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

const DeckStatusTime = <T extends DeckSchema>({
  model,
  className,
}: { model: T | null } & Omit<
  ComponentProps<typeof ShopFeedItemTime>,
  'status' | 'availability_start_date' | 'availability_end_date'
>) => {
  if (!model) return null;
  const { availability_start_date: startDate, availability_end_date: endDate, deck } = model;
  const salesStatus = useShopItemByDateStatus({ endDate, startDate });
  if (salesStatus !== 'yet' && salesStatus !== 'soon') return null;

  const setItemMutate: ShopFeedTimerDepsStore['onCompleteTimer'] = (dateField) => {
    changeDeckShopItemLocally(deck.id, () => {
      return {
        [dateField === 'startDate' ? 'availability_start_date' : 'availability_end_date']: null,
      };
    });
  };
  return (
    <ShopFeedItemTimerDepsProvider value={{ onCompleteTimer: setItemMutate }}>
      <ShopFeedItemTime
        className={cn('bg-secondary absolute bottom-0 left-0 z-[200]', className)}
        startDate={model.availability_start_date}
        endDate={model.availability_end_date}
      />
    </ShopFeedItemTimerDepsProvider>
  );
};
export const DeckCardWithGrayByTime = ({ deck }: { deck: DeckSchema }) => {
  const saleStatus = useShopItemByDateStatus({
    startDate: deck.availability_start_date,
    endDate: deck.availability_end_date,
  });
  const compoundDeck = { ...deck, ...deck.deck };

  const status = getItemStatus(compoundDeck);
  return (
    <DeckCard
      shouldBeDisabled={saleStatus === 'infinite-or-past' && status === 'unavailable-by-date'}
      imageBottomSlot={<DeckStatusTime model={compoundDeck} />}
      model={compoundDeck}
      withPrice
    />
  );
};
export const DecksPage = () => {
  const { data, isLoading, fetchNextPage, hasNextPage } = useShopDecksPaginatedListSuspenseQuery({
    variables: {},
  });
  const deckItems = data?.pages.flatMap((page) => page.results) || [];

  const FlatList: FlatListType<DeckSchema[]> = _FlatList;

  const shopFeedTourProps = useTourItem('shop-feed-list-item-1');

  return (
    <FlatList.Root isLoading={isLoading} content={deckItems}>
      <FlatList.Layout
        className={cn(
          'grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
          {
            'grid-cols-2': deckItems.length < 5,
          }
        )}
      >
        <FlatList.Content>
          {({ item, attributes, index }) => (
            <Link
              prefetch={false}
              key={item.id}
              {...attributes}
              href={Routing.Deck.open({ params: { id: item?.deck?.id } })}
              {...(index === 0 ? shopFeedTourProps : {})}
            >
              <DeckCardWithGrayByTime deck={item} />
            </Link>
          )}
        </FlatList.Content>
        <FlatList.EdgeTrigger canTrigger={hasNextPage && !isLoading} onTrigger={fetchNextPage} />
      </FlatList.Layout>

      <FlatList.Empty className="w-full" text="Пусто" emoji="🎴" />
    </FlatList.Root>
  );
};
