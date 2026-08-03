import * as React from 'react';

import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';

import { CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';

export const PromotionSkeleton = () => (
  <CarouselSkeleton className="w-full">
    <CarouselContent className="mx-1.5 md:mr-0 md:-ml-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <CarouselItem
          key={index}
          className="basis-[90%] sm:basis-1/2 md:basis-1/2 md:pl-4 lg:basis-1/3"
        >
          <SkeletonV2 className="h-42 w-full rounded-md" />
        </CarouselItem>
      ))}
    </CarouselContent>
  </CarouselSkeleton>
);
