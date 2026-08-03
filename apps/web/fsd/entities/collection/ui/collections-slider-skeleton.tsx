import * as React from 'react';

import { CollectionCardSkeleton } from '~entities/collection/ui/collection-card';
import { CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';

export const CollectionsSliderSkeleton = () => (
  <CarouselSkeleton className="w-full">
    <CarouselContent className="mx-1.5 md:mr-0 md:-ml-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <CarouselItem
          key={index}
          className="basis-[70%] sm:basis-[40%] md:basis-[45%] md:pl-4 lg:basis-[35%]"
        >
          <CollectionCardSkeleton />
        </CarouselItem>
      ))}
    </CarouselContent>
  </CarouselSkeleton>
);
