'use client';

import { VerticalTitleCardSkeleton } from '~entities/title/ui/vertical-title-card-skeleton';
import { CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';

export const HeroSliderSkeleton = () => (
  <CarouselSkeleton className="w-full">
    <CarouselContent className="max-sm:ml-4">
      {Array.from({ length: 20 }).map((_, index) => (
        <CarouselItem
          key={index}
          tabIndex={-1}
          className="flex-[0_0_135px] max-sm:pr-2 md:flex-[0_0_160px] lg:flex-[0_0_170px]"
        >
          <VerticalTitleCardSkeleton />
        </CarouselItem>
      ))}
    </CarouselContent>
  </CarouselSkeleton>
);
