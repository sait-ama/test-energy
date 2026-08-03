import React, { ComponentProps, memo, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { cn } from '@re/ui-kit/utils/cn';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { getHeroCardsByUserInfiniteQuery } from '~entities/inventory/model/queries';
import { HeroCard, HeroCardSkeleton } from '~entities/inventory/ui/hero-card';
import { MAX_CARDS_4_COLLECTION } from '~features/(manage-card-collections)/manage-forms/model/consts';
import { SelectCardHandler } from '~features/(manage-card-collections)/manage-forms/ui/fields/cards/form-item';
import { HeroCardItemSchema } from '~shared/api/models/inventory';
import { Ordering } from '~shared/api/models/ordering';
import { useSession } from '~shared/lib/session/use-session';
import {
  FlatList as _FlatList,
  FlatListContainerProps,
  FlatListContentProps,
  FlatListLoadingProps,
  type FlatListType,
} from '~shared/ui/flat-list-v2';
import { deduplicate } from '~shared/utils/record-deduplicator';

const FlatList: FlatListType<HeroCardItemSchema[]> = _FlatList;

const ListContainer = ({
  children,
  onClick,
  className,
  outOfFlatList,
  ...props
}: FlatListContainerProps & { outOfFlatList?: boolean }) => {
  const Comp = FlatList[outOfFlatList ? 'Layout' : 'Container'];
  return (
    <Comp
      className={cn(
        'my-2 grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Comp>
  );
};
export const ExternalListContainer = (props: FlatListContainerProps) => {
  return <ListContainer {...props} outOfFlatList />;
};
export const ListSuspense = memo(() =>
  new Array(20).fill(0).map((_, i) => <HeroCardSkeleton key={i} />)
);
export const CardList = memo(
  ({
    selectedCards,
    onCardSelect,
    className,
    itemClassName,
    maxCards = MAX_CARDS_4_COLLECTION,
    ...props
  }: {
    selectedCards: HeroCardItemSchema[];
    onCardSelect: SelectCardHandler;
    itemClassName?: string;
    maxCards?: number;
  } & ComponentProps<'div'>) => {
    const t = useTranslations('reusable.empty_states');
    const searchParams = useSearchParams();
    const ordering = searchParams.get('ordering') as
      | Ordering
      | `-${Ordering}`
      | `-${Ordering.TIME}`;
    const sessionId = useSession((v) => v?.id!);
    const {
      data: { pages = [] } = {},
      fetchNextPage,
      isFetching,
      hasNextPage,
      isFetchingNextPage,
      //   @ts-ignore
    } = useSuspenseInfiniteQuery({
      // placeholderData: isServer ? undefined : [],
      ...getHeroCardsByUserInfiniteQuery({
        variables: { params: { userId: sessionId }, query: { ordering } },
      }),
    });

    const cards = useMemo(
      () => deduplicate(pages?.flatMap?.((page) => page.results) || [], (card) => card.id),
      [pages]
    );

    const renderItem: FlatListContentProps<(typeof cards)[0]>['children'] = useCallback(
      ({ item: { card }, index }) => {
        const isSelected = selectedCards.find((v) => v.card.id === card.id);
        const isDisabled = !isSelected && selectedCards.length >= maxCards;

        return (
          <HeroCard
            imgClassName="size-full"
            key={card.id}
            data-index={index}
            card={card}
            withBorder
            withHover
            className={cn(
              'border-border relative aspect-[2/3] !h-auto cursor-pointer rounded-xs border p-2 transition-all',
              isSelected && 'bg-accent border-primary/40 ring-primary ring-2',
              isDisabled && 'cursor-not-allowed opacity-50',
              itemClassName
            )}
          />
        );
      },
      [selectedCards]
    );
    const renderLoading: FlatListLoadingProps['children'] = useCallback(({ key }) => {
      return <HeroCardSkeleton key={key} />;
    }, []);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const cardElement = target.closest('[data-index]');
        if (!cardElement) return;

        const cardIndex = Number(cardElement.getAttribute('data-index'));
        const card = cards[cardIndex]!;
        onCardSelect(card);
      },
      [onCardSelect, cards]
    );

    return (
      <FlatList.Root
        content={cards}
        isLoading={isFetchingNextPage || isFetching}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      >
        <ListContainer {...props} className={className} onClick={handleClick}>
          <FlatList.Content>{renderItem}</FlatList.Content>
          <FlatList.Loading count={30}>{renderLoading}</FlatList.Loading>

          <FlatList.Empty text={t('empty')} emoji="🎴" />

          <FlatList.EdgeTrigger
            onTrigger={fetchNextPage}
            canTrigger={!isFetchingNextPage && hasNextPage}
          />
        </ListContainer>
      </FlatList.Root>
    );
  }
);
