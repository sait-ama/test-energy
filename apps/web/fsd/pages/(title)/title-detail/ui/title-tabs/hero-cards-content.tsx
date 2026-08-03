'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import { useHeroCardsByTitleInfinite } from '~entities/inventory/model/queries';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import { useTitleDetail } from '~entities/title/model/queries';
import { useHeroCardModal } from '~shared/lib/card/use-card-modal';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

export interface HeroCardsContentProps extends Omit<ComponentPropsWithoutRef<'div'>, 'content'> {}

export const HeroCardsContent = (props: HeroCardsContentProps) => {
  const { className, ...rest } = props;
  const { setCard } = useHeroCardModal();

  const { dir } = useParams<{ dir: string }>();
  const { data: title } = useTitleDetail({ variables: { params: { dir } } });
  const { data, isFetchingNextPage, hasNextPage, isLoading, fetchNextPage } =
    useHeroCardsByTitleInfinite({
      variables: { params: { titleId: title!.id }, query: { ordering: 'rank' } },
    });

  const cards = useMemo(() => data?.pages.flatMap((v) => v.results) || [], [data]);

  const FlatList: FlatListType<typeof cards> = _FlatList;

  return (
    <FlatList.Root
      content={cards}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      className={className}
      {...rest}
    >
      <FlatList.Container className="xs:grid-cols-3 grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4">
        <FlatList.Content>
          {({ item }) => (
            <HeroCard
              key={item.id}
              withBorder
              withHover
              card={item}
              onClick={() => {
                setCard(item);
              }}
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={20}>
          {({ key }) => <HeroCard loading key={key} />}
        </FlatList.Loading>
        <FlatList.Empty text="Пусто" emoji="🎴" />
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={!isFetchingNextPage && hasNextPage}
        />
      </FlatList.Container>
    </FlatList.Root>
  );
};
