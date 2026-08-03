import { ComponentProps, useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import { AverageCard } from '~entities/card-collections/model/types';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import {
  MAX_CARDS_4_COLLECTION,
  MIN_CARDS_4_COLLECTION,
} from '~features/(manage-card-collections)/manage-forms/model/consts';
import type { ShortCardItemSchema } from '~shared/api/models/shop';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~shared/ui/carousel';

export interface CardCollectionHorizontalCard extends ComponentProps<'div'> {
  items: AverageCard[];
  maxCards?: number;
  className?: string;
  visibleSlots?: number;
  animationDuration?: number;
}

//todo migrate to implementation from entity, ready right now
export const CardCollectionHorizontalCards = ({
  items,
  maxCards = MAX_CARDS_4_COLLECTION,
  visibleSlots = MIN_CARDS_4_COLLECTION,
  animationDuration = 400,
}: CardCollectionHorizontalCard) => {
  const [displayedItems, setDisplayedItems] = useState<(AverageCard | null)[]>(() =>
    new Array(visibleSlots).fill(null)
  );
  useEffect(() => {
    const initialItems: (null | AverageCard)[] = [...items];
    while (initialItems.length < visibleSlots) {
      initialItems.push(null);
    }
    setDisplayedItems(initialItems.slice(0, maxCards));
  }, []);

  useEffect(() => {
    const newItems: (null | AverageCard)[] = [...items];

    while (newItems.length < visibleSlots) {
      newItems.push(null);
    }

    const limitedItems = newItems.slice(0, maxCards);

    setDisplayedItems(limitedItems);
  }, [items, visibleSlots, maxCards]);

  // @ts-ignore
  return (
    <Carousel opts={{ align: 'start', dragFree: true }} className="w-full flex-[1_0_auto]">
      <CarouselContent className="ml-0">
        <AnimatePresence initial={false} mode="popLayout" custom={animationDuration}>
          {displayedItems.map((item, index) => (
            <CarouselItem
              asChild
              key={item?.id ? `item-${item.id}` : `slot-${index}`}
              className="basis-1/3 sm:basis-1/3 md:basis-[25%] lg:basis-[17%]"
            >
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: animationDuration / 1000,
                  ease: 'easeInOut',
                }}
                className="h-full"
                style={{
                  // @ts-expect-error
                  ['--animation-duration']: `${animationDuration}ms`,
                }}
              >
                {item ? (
                  <HeroCard card={item as ShortCardItemSchema} />
                ) : (
                  <div className="border-border aspect-[2/3] h-full rounded-lg border-2 [--padding:16px]" />
                )}
              </motion.div>
            </CarouselItem>
          ))}
        </AnimatePresence>
      </CarouselContent>
      <CarouselNext />
      <CarouselPrevious />
    </Carousel>
  );
};
