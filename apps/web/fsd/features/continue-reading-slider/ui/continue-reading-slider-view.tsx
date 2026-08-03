'use client';
import { memo } from 'react';

import { HorizontalHistoryCard } from '~features/continue-reading-slider/ui/horizontal-history-card';
import { yaMetrika } from '~shared/lib/metrics/yandex-metrika/metrika';
import { MetrikaGoals } from '~shared/lib/metrics/yandex-metrika/metrika-goals';
import { Carousel, CarouselContent, CarouselItem } from '~shared/ui/carousel';

interface SliderViewProps {
  blockName?: string;
  data?: any;
}

export const ContinueReadingSliderView = memo((props: SliderViewProps) => {
  const { blockName, data } = props;

  const handleClick = () => {
    // @ts-ignore
    if (blockName) yaMetrika.reachGoal(MetrikaGoals.IndexPage[blockName]);
  };

  const content = data?.pages?.flatMap((it) => it.results) ?? [];

  if (!content.length) return null;

  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="max-sm:ml-4">
        {/* @ts-ignore */}
        {content.slice(0, 10).map((item, index) => (
          <CarouselItem
            key={index}
            onClick={handleClick}
            className="basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
            <HorizontalHistoryCard model={item} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
});
