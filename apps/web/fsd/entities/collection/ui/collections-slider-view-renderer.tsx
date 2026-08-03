'use client';

import { cn } from '@re/ui-kit/utils/cn';

import { CollectionSchema } from '~shared/api/models/collectionSchema';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~shared/ui/carousel';

export interface CollectionSliderViewProps<T> {
  data?: T[];
  onItemClick?: (item: T, index: number) => void;
  itemClassName?: string;
  className?: string;
  children?: (item: T, index: number) => React.ReactNode;
}

export const CollectionsSliderRenderer = <T = CollectionSchema,>(
  props: CollectionSliderViewProps<T>
) => {
  const { data = [], onItemClick, itemClassName, children, className } = props;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      // plugins={[Autoplay({ playOnInit: true, delay: 5000, stopOnMouseEnter: true, stopOnInteraction: true })]}
      className="w-full"
    >
      <CarouselContent className={cn('max-sm:pl-4', className)}>
        {data.map((item, index) => (
          <CarouselItem
            onClick={
              onItemClick
                ? () => {
                    onItemClick(item, index);
                  }
                : undefined
            }
            key={index}
            className={cn(
              'basis-[45%] sm:basis-[45%] md:basis-1/3 md:basis-[25%] xl:basis-[20%]',
              itemClassName
            )}
          >
            {/* @ts-ignore */}
            {children?.(item, index)}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext />
      <CarouselPrevious />
    </Carousel>
  );
};
