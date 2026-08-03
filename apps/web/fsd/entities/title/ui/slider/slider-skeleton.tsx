import { CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';

import { VerticalTitleCardSkeleton } from '../vertical-title-card-skeleton';

export const SliderSkeleton = () => (
  <CarouselSkeleton className="w-full">
    <CarouselContent className="max-sm:ml-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <CarouselItem
          key={index}
          className="basis-[33%] max-sm:pr-2 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7"
        >
          <VerticalTitleCardSkeleton />
        </CarouselItem>
      ))}
    </CarouselContent>
  </CarouselSkeleton>
);
