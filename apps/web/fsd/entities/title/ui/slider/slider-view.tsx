'use client';

import { memo, ReactNode } from 'react';

import { getListContentBridge, getTitleContentBridge } from '~shared/lib/title-content-bridge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~shared/ui/carousel';

//todo
interface SliderViewProps<T> {
  novel?: boolean;
  blockName?: string;
  data?: any;
  onItemClick?: (item: T, index: number) => void;
  children?: ({ model }: { model: T }) => ReactNode;
}

export const SliderView = memo(<T,>(props: SliderViewProps<T>) => {
  const { onItemClick, children } = props;

  if (!children) {
    throw new Error('List view expect a children to render');
  }

  if (typeof children !== 'function') {
    throw new Error('Children should be a function');
  }

  const content = getListContentBridge(props.data);

  if (!content.length) return null;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
        slidesToScroll: 4,
      }}
    >
      <CarouselContent className="max-sm:ml-4">
        {/* @ts-ignore */}
        {content.map((item, index) => {
          const handleClick = onItemClick
            ? () => {
                onItemClick(item as T, index);
              }
            : undefined;

          return (
            <CarouselItem
              key={index}
              asChild
              onClick={handleClick}
              className="basis-[33%] max-sm:pr-2 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7"
            >
              {children({ model: getTitleContentBridge(item) as T })}
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselNext yAxis="calc(50% - 35px)" />
      <CarouselPrevious yAxis="calc(50% - 35px)" />
    </Carousel>
  );
});
