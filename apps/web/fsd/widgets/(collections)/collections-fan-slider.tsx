'use client';

import * as React from 'react';
import { Suspense } from 'react';

import {
  CollectionFanCard,
  CollectionFanCardSkeleton,
} from '~entities/collection/ui/v3/collection-card';
import type { CollectionSchema } from '~shared/api/models/collectionSchema';
import type { ShortTitleSchema } from '~shared/api/models/title';
import { CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';

interface CollectionsFanSliderProps {
  collections: CollectionSchema[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onTitleAction?: (title: ShortTitleSchema, action: 'like' | 'bookmark' | 'share') => void;
  onCollectionClick?: (collection: CollectionSchema) => void;
}

export const CollectionsFanSlider = ({
  collections,
  className,
  size = 'md',
  onTitleAction,
  onCollectionClick,
}: CollectionsFanSliderProps) => {
  return (
    <div className={className}>
      <CarouselContent className="mx-1.5 md:mr-0 md:-ml-4">
        {collections.map((collection) => (
          <CarouselItem
            key={collection.id}
            className="basis-[70%] sm:basis-[40%] md:basis-[45%] md:pl-4 lg:basis-[35%]"
          >
            <Suspense fallback={<CollectionFanCardSkeleton size={size} />}>
              <CollectionFanCard
                collection={collection}
                size={size}
                onTitleAction={onTitleAction}
                onCollectionClick={onCollectionClick}
              />
            </Suspense>
          </CarouselItem>
        ))}
      </CarouselContent>
    </div>
  );
};

export const CollectionsFanSliderSkeleton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <CarouselSkeleton className="w-full">
    <CarouselContent className="mx-1.5 md:mr-0 md:-ml-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <CarouselItem
          key={index}
          className="basis-[70%] sm:basis-[40%] md:basis-[45%] md:pl-4 lg:basis-[35%]"
        >
          <CollectionFanCardSkeleton size={size} />
        </CarouselItem>
      ))}
    </CarouselContent>
  </CarouselSkeleton>
);
