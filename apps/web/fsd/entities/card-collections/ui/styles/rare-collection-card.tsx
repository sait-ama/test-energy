import { ReactNode } from 'react';

import ArrowRight from '@re/ui-kit/icons/arrow-right';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import {
  BaseCollectionCard,
  BaseCollectionCardListContent,
  BaseCollectionCardProps,
  BaseCollectionWrapper,
} from '~entities/card-collections/ui/styles/base-card';
import type { UserRareCollection } from '~shared/api/generated/models';
import { CarouselNext, CarouselPrevious } from '~shared/ui/carousel';

export interface RareCollectionCardProps extends BaseCollectionCardProps<UserRareCollection> {
  rewardCardSlot: ReactNode;
}

// если сильно путает, юзайте просто CollectionCardComp
export const RareCollectionCardWithArrow = ({
  rightSlot,
  model,
  withEmptySlots,
  children,
  leftSlot,
  rewardCardSlot,
}: RareCollectionCardProps) => {
  const cardsCount = model.cards.length;
  const aFewCards = cardsCount <= 3;

  return (
    <BaseCollectionWrapper>
      <BaseCollectionCard
        withEmptySlots={withEmptySlots}
        rightSlot={rightSlot}
        model={model}
        leftSlot={leftSlot}
      >
        <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:items-stretch">
          <BaseCollectionCardListContent
            //center cards when a few cards on mobile
            innerClassName={cn({ 'justify-center sm:justify-stretch': aFewCards })}
            floatSlot={
              <>
                <CarouselNext
                  className={cn('right-0 sm:visible xl:-right-0', {
                    'md:hidden': aFewCards,
                  })}
                />
                <CarouselPrevious
                  className={cn('sm:visible xl:-right-0', {
                    'md:hidden': aFewCards,
                  })}
                />
              </>
            }
            hideNavigation
          >
            {children}
          </BaseCollectionCardListContent>

          <span className={cn('flex w-11 items-center justify-center self-center md:self-stretch')}>
            <Button
              className="self-senter h-10 w-10 rotate-90 md:rotate-0"
              variant="outline"
              circle
            >
              <ArrowRight />
            </Button>
          </span>
          <div
            className={cn(
              'mr-4 basis-[30%] [--padding:0px] last:mr-0 sm:basis-[33%] md:basis-[25%] lg:basis-[18.5%]',
              '!max-md:basis-1 max-md:flex max-md:size-full max-md:max-h-[310px] max-md:items-center max-md:justify-center'
            )}
          >
            {rewardCardSlot}
          </div>
        </div>
      </BaseCollectionCard>
    </BaseCollectionWrapper>
  );
};
