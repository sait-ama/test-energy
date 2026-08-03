import * as React from 'react';

import { VerticalUserCard } from '~entities/user/ui/vertical-user-card';
import { CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';

export const SliderSkeleton = () => (
  <CarouselSkeleton className="w-full">
    <CarouselContent className="mx-1.5 md:mr-0 md:-ml-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <CarouselItem
          key={index}
          className="basis-[30%] sm:basis-1/3 md:basis-1/5 md:pl-4 lg:basis-1/7"
        >
          <VerticalUserCard isLoading className="w-full" model={null} />
        </CarouselItem>
      ))}
    </CarouselContent>
  </CarouselSkeleton>
);
