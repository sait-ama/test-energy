'use client';

import { lazy, memo, Suspense, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import LockIcon from '@re/ui-kit/icons/lock';
import StarIcon from '@re/ui-kit/icons/star-favorite';
import VolumeOn from '@re/ui-kit/icons/volume-on';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@re/ui-kit/ui/tooltip';
import { cn } from '@re/ui-kit/utils/cn';

import { useHeroCardsByUserInfinite } from '~entities/inventory/model/queries';
import { HeroCardItem } from '~entities/inventory/ui/item/hero-card-item';
import { useHeroCardModal } from '~shared/lib/card/use-card-modal';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

import {
  useHeroCardsActionStore,
  useHeroCardsFiltersStore,
  useSelection,
} from '../store/hero-cards-store';
import { pickQueryFromHeroCardsFilters } from '../utils';

const HeroCardOrderingEditModal = lazy(() =>
  import(
    /* webpackChunkName: "HeroCardOrderingEditModal" */ '~pages/(user)/inventory-tab/ui/hero-card-ordering-edit'
  ).then((m) => ({
    default: m.HeroCardOrderingEditModal,
  }))
);
const HeroCardExchangeableEditModal = lazy(() =>
  import(
    /* webpackChunkName: "HeroCardExchangeableEditModal" */ '~pages/(user)/inventory-tab/ui/hero-card-exchangeable-edit'
  ).then((m) => ({
    default: m.HeroCardExchangeableEditModal,
  }))
);

const HeroCardsList = memo(() => {
  const t = useTranslations('user.pages.inventory');
  const { id } = useParams<{ id: string }>();
  const { filters } = useHeroCardsFiltersStore();

  const query = pickQueryFromHeroCardsFilters(filters);

  const heroCardsQuery = useHeroCardsByUserInfinite({
    variables: {
      params: { userId: id },
      query: { ordering: query.ordering || 'rank', ...query },
    },
  });

  const heroCards = useMemo(
    () => heroCardsQuery.data?.pages?.flatMap((v) => v.results) || [],
    [heroCardsQuery.data]
  );

  const selectionHandlers = useSelection();
  const { setCard } = useHeroCardModal();

  const FlatList: FlatListType<typeof heroCards> = _FlatList;

  return (
    <FlatList.Root
      content={heroCards}
      isLoading={heroCardsQuery.isLoading}
      hasNextPage={heroCardsQuery.hasNextPage}
      isFetchingNextPage={heroCardsQuery.isFetchingNextPage}
    >
      <FlatList.Container className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <FlatList.Content>
          {({ item }) => (
            <HeroCardItem
              onClick={() => {
                if (selectionHandlers) {
                  selectionHandlers.switchSelection(item.card.id);
                  return;
                }
                setCard(item.card);
              }}
              card={item.card}
              key={item.id}
              floatingSlot={
                <>
                  {item.is_favorite ? (
                    <div className="bg-background/70 absolute top-2 left-2 rounded-full px-3 py-2">
                      <StarIcon />
                    </div>
                  ) : null}

                  {!item.is_exchangeable ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="bg-background/70 absolute right-2 bottom-2 rounded-full px-3 py-2">
                            <LockIcon />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t('no-exchange-tooltip')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : null}

                  <div className="absolute top-2 right-2 z-50 flex gap-2">
                    {item.stack_count > 1 ? (
                      <div className="bg-background/70 flex h-8 min-w-8 items-center justify-center rounded-full px-2">
                        <ReText>x{item.stack_count}</ReText>
                      </div>
                    ) : null}
                    {item.card.has_audio ? (
                      <div className="bg-background/70 flex h-8 min-w-8 items-center justify-center rounded-full">
                        <VolumeOn />
                      </div>
                    ) : null}
                  </div>
                </>
              }
              isActive={!!selectionHandlers && selectionHandlers.isSelected(item.card.id)}
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={20}>
          {({ key }) => <HeroCardItem loading key={key} />}
        </FlatList.Loading>
        <FlatList.Empty text="Пусто" emoji="🎴" className="col-span-full" />
        <FlatList.EdgeTrigger
          onTrigger={heroCardsQuery.fetchNextPage}
          canTrigger={!heroCardsQuery.isFetchingNextPage && heroCardsQuery.hasNextPage}
        />
      </FlatList.Container>
    </FlatList.Root>
  );
});
HeroCardsList.displayName = 'HeroCardsList';

export const HeroCardsTab = memo(() => {
  const { isEditFavorite, isEditExchangeable } = useHeroCardsActionStore();
  const t = useTranslations('user.pages.inventory.selection');

  return (
    <div>
      <HeroCardsList />
      {isEditFavorite ? (
        <Suspense>
          <HeroCardOrderingEditModal>
            {({ count, max }) => (
              <div
                className={cn(
                  'cs-modal-change border-border bg-popover/50 fixed right-1/2 bottom-16 z-[3] mt-5 translate-x-1/2 rounded-full border p-4 md:bottom-4'
                )}
              >
                <Button>{t('favorite-edit-text', { count, max })}</Button>
              </div>
            )}
          </HeroCardOrderingEditModal>
        </Suspense>
      ) : null}
      {isEditExchangeable ? (
        <Suspense>
          <HeroCardExchangeableEditModal>
            {({ count, max }) => (
              <div
                className={cn(
                  'border-border bg-popover/50 fixed right-1/2 bottom-16 z-[3] mt-5 translate-x-1/2 rounded-full border p-4 md:bottom-4'
                )}
              >
                <Button>{t('exchangeable-edit-text', { count, max })}</Button>
              </div>
            )}
          </HeroCardExchangeableEditModal>
        </Suspense>
      ) : null}
    </div>
  );
});

HeroCardsTab.displayName = 'HeroCardsTab';
