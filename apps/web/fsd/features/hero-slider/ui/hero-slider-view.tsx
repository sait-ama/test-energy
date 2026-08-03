'use client';
import { memo } from 'react';

import { useCollectRequests } from '~entities/home/model/hooks';
import { yaMetrika } from '~shared/lib/metrics/yandex-metrika/metrika';
import { MetrikaGoals } from '~shared/lib/metrics/yandex-metrika/metrika-goals';
import { getListContentBridge } from '~shared/lib/title-content-bridge';
import { Carousel, CarouselContent, CarouselItem } from '~shared/ui/carousel';

import { HeroSliderViewItem } from './hero-slider-view-item';

interface SliderViewProps<T> {
  data?: T[];
}

export const HeroSliderView = memo(<T,>(props: SliderViewProps<T>) => {
  const onView = useCollectRequests();

  const handleClick = () => {
    yaMetrika.reachGoal(MetrikaGoals.IndexPage.topSlider);
  };

  const content = getListContentBridge(props.data);

  if (!content.length) return null;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="max-sm:ml-4">
        {content.map((item, index) => (
          <CarouselItem
            key={index}
            asChild
            className="flex-[0_0_135px] max-sm:pr-2 md:flex-[0_0_160px] lg:flex-[0_0_170px]"
            onClick={handleClick}
          >
            {/* @ts-ignore */}
            <HeroSliderViewItem index={index} onView={onView} model={item} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
});
