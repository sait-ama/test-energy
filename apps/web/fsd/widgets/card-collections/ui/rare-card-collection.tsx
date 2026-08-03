import React, { ComponentProps, useMemo } from 'react';

import { UserRareCollection } from '@re/api/generated/types.gen';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { useTranslations } from 'use-intl';

import { canExchangeCollection, resolvedName } from '~entities/card-collections/model/utils';
import { CardCollectionAmount } from '~entities/card-collections/ui/styles/card-collection-amount';
import { RareCollectionCardWithArrow } from '~entities/card-collections/ui/styles/rare-collection-card';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import { HeroCardPreviewModalTrigger } from '~entities/inventory/ui/hero-card-preview';
import { Rewardable } from '~features/(collection-card)/ui/reward-info';
import { ExchangeButton } from '~widgets/card-collections/ui/exchange-button';

export interface RareCardCollectionCardProps extends ComponentProps<'div'> {
  model: UserRareCollection;
  heroAttr?: ComponentProps<'div'> | { 'data-index': number };
}

export const RareCardCollection = ({ model: item, heroAttr }: RareCardCollectionCardProps) => {
  const tCard = useTranslations('collections');
  const currentAmount = useMemo(
    () =>
      item.cards.reduce((acc, cur) => {
        acc += Number(cur.has);
        return acc;
      }, 0),
    [item]
  );

  const canExchange = canExchangeCollection(item);

  return (
    <RareCollectionCardWithArrow
      rewardCardSlot={
        <HeroCardPreviewModalTrigger asChild card={item.reward_card as any}>
          <HeroCard
            {...heroAttr}
            imgClassName={cn(
              'size-full transition:hover  duration-200 bg-secondary hover:bg-muted',
              {
                'opacity-[0.4]': !canExchangeCollection(item),
              }
            )}
            withBorder
            withHover
            imgSize="high"
            className={cn(
              'hover:bg-muted mr-4 basis-[30%] [--padding:0px] last:mr-0 sm:basis-[33%] md:basis-[25%] lg:basis-[18.5%]'
            )}
            loading={!item.reward_card?.cover}
            card={item.reward_card as any}
            key={item.reward_card.id}
          />
        </HeroCardPreviewModalTrigger>
      }
      withEmptySlots={false}
      leftSlot={
        <>
          <div className="flex flex-wrap-reverse items-center gap-2">
            <ReText breakable lineClamp={1} className="line-clamp-1 break-all">
              {resolvedName(item.name)}
            </ReText>
            <span className="flex gap-2 max-sm:flex-wrap-reverse">
              <CardCollectionAmount amount={item.cards.length} currentAmount={currentAmount} />
            </span>
          </div>
        </>
      }
      rightSlot={
        <Rewardable
          float={<ExchangeButton key={item.id} model={item} />}
          key={item.id}
          model={item}
        >
          <Button variant={!canExchange ? 'secondary' : 'default'}>
            {tCard('exchangeable-item.actions.exchange')}
          </Button>
        </Rewardable>
      }
      model={item}
      key={item.id}
    >
      {({ item: card, isEmpty }) => (
        <HeroCardPreviewModalTrigger card={card as any} asChild>
          <HeroCard
            imgClassName={cn(
              'size-full dark:hover:border-primary dark:hover:bg-accent/20 transition-colors transition:hover duration-200 bg-secondary',
              {
                'opacity-40': !card?.has,
              }
            )}
            withBorder
            withHover
            imgSize="high"
            className={cn('hover:bg-muted')}
            loading={isEmpty || !card?.cover}
            card={card as any}
            key={item.id}
          />
        </HeroCardPreviewModalTrigger>
      )}
    </RareCollectionCardWithArrow>
  );
};
