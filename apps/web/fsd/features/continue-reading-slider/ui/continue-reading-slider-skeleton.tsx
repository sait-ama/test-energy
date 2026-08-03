import * as React from 'react';

import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';

import { CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';

export const ContinueReadingSliderSkeleton = () => (
  <CarouselSkeleton className="w-full">
    <CarouselContent className="mx-1.5 md:mr-0 md:-ml-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <CarouselItem
          key={index}
          className="basis-[75%] rounded-sm sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4"
        >
          <SkeletonV2 className="h-[130px] w-full" />
        </CarouselItem>
      ))}
    </CarouselContent>
  </CarouselSkeleton>
);
