import React, { ComponentProps, ReactNode } from 'react';

import { createContext } from '@re/core/utils/create-context';
import { cn } from '@re/ui-kit/utils/cn';

import { AbstractCard, AbstractCollection } from '~entities/card-collections/model/types';
import { MIN_CARDS_4_COLLECTION } from '~features/(manage-card-collections)/manage-forms/model/consts';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~shared/ui/carousel';
//todo any
const { Provider, useStore } = createContext<
  AbstractCollection<unknown>,
  AbstractCollection<unknown>
>((v) => v, 'CollectionCardDepsContext');

export type ItemRenderer<T extends AbstractCard> =
  | ReactNode
  | ((props: { item: T | null; isEmpty: boolean; index: number }) => ReactNode);

export interface CardCollectionRootProps<I extends AbstractCard> {
  collection: AbstractCollection<I>;
  children: ReactNode | ReactNode[];
}

export interface CardCollectionSliderProps extends ComponentProps<'div'> {
  hideNavigationWithEmptySlots?: boolean;
  children: ReactNode;
  innerClassName?: string;
  hideNavigation?: boolean;
  floatSlot?: ReactNode;
}

export interface SliderItemsRendererProps<T extends AbstractCard> {
  emptySlotsCount?: number;
  children: ItemRenderer<T>;
  itemWrapperClassName?: string;
}

export function CardCollectionRoot<I extends AbstractCard>({
  collection,
  children,
}: CardCollectionRootProps<I>) {
  return <Provider value={collection}>{children}</Provider>;
}

export function CardCollectionSlider({
  children,
  className,
  hideNavigation,
  floatSlot,
  innerClassName,
}: CardCollectionSliderProps) {
  return (
    <Carousel opts={{ align: 'center', dragFree: true }} className={cn('w-full', className)}>
      <CarouselContent className={cn('ml-0', innerClassName)}>{children}</CarouselContent>
      {!hideNavigation && (
        <>
          {/*todo не достучаться*/}
          <CarouselNext style={{ display: 'flex' }} className="visible right-0 max-sm:visible" />
          <CarouselPrevious
            style={{ display: 'flex' }}
            className="visible max-sm:visible xl:-right-0"
          />
        </>
      )}
      {floatSlot}
    </Carousel>
  );
}

export function SliderItemsRenderer<T extends AbstractCard>({
  emptySlotsCount = MIN_CARDS_4_COLLECTION,
  children,
  itemWrapperClassName,
}: SliderItemsRendererProps<T>) {
  const cards = useStore((v) => v.cards as T[]);
  const isEmpty = cards.length === 0;

  const slots =
    cards.length < emptySlotsCount
      ? [...cards, ...Array(Math.max(emptySlotsCount - cards.length, 0))]
      : cards;

  return (
    <>
      {slots.map((item, index) => {
        const key = item && item?.id ? `item-${item.id}` : `slot-${index}`;
        const renderer =
          typeof children === 'function' ? children({ item, isEmpty, index }) : children;

        return (
          <CarouselItem
            asChild
            key={key}
            className={cn(
              'mr-4 basis-[30%] [--padding:0px] last:mr-0 sm:basis-[33%] md:basis-[25%] lg:basis-[18.5%]',
              itemWrapperClassName
            )}
          >
            {renderer}
          </CarouselItem>
        );
      })}
    </>
  );
}

const SlotSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('border-border aspect-[2/3] h-full rounded-lg border-2', className)} />
);

export type CardCollectionCompType<I extends AbstractCard> = {
  Root: (props: CardCollectionRootProps<I>) => ReactNode;
  List: {
    Slot: typeof SlotSkeleton;
    Content: typeof CardCollectionSlider;
    Items: typeof SliderItemsRenderer<I>;
  };
};

export const CardCollectionComp = {
  // export const Store = {Provider, Consumer, useStore}
  Root: CardCollectionRoot,

  List: {
    Slot: SlotSkeleton,
    Content: CardCollectionSlider,
    Items: SliderItemsRenderer,
  },
};
