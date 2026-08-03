'use client';

import type { Promotion } from '~shared/api/models/promotion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~shared/ui/carousel';

import { PromotionDetailDialogProvider } from './promotion-detail-dialog-provider';
import { PromotionItem } from './promotion-item';

interface SliderViewProps<T> {
  data?: T[];
}

// TODO пошел нахуй тайпскрипт на v1 api, но оно работает
export const PromotionsView = (props: SliderViewProps<Promotion>) => {
  const { data } = props;

  return (
    <PromotionDetailDialogProvider>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="max-sm:pl-4">
          {/* TODO пошел нахуй тайпскрипт на v1 api, но оно работает */}
          {/* @ts-ignore */}
          {data?.content?.map((item, index) => (
            <CarouselItem
              key={index}
              className="basis-[90%] sm:basis-1/2 md:basis-1/2 xl:basis-1/3"
            >
              <PromotionItem data={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </PromotionDetailDialogProvider>
  );
};
