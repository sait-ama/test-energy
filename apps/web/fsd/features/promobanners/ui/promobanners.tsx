'use client';

import { getImageProps } from 'next/image';
import Link from 'next/link';

import { useSuspenseQuery } from '@tanstack/react-query';
import Autoplay from 'embla-carousel-autoplay';

import { ReText } from '@re/ui-kit/ui/text';

import { HomeSection } from '~entities/home/ui/home-section';
import { client } from '~shared/api/client';
import { BannerSlider } from '~shared/api/generated/models';
import { v2FunctionsBannerSlidersListOptions } from '~shared/api/generated/tanstack';
import { yaMetrika } from '~shared/lib/metrics/yandex-metrika/metrika';
import { MetrikaGoals } from '~shared/lib/metrics/yandex-metrika/metrika-goals';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~shared/ui/carousel';
import { shuffleArray } from '~shared/utils/shuffle';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface PromobannerItemProps {
  model: BannerSlider;
}

const PromobannerItem = (props: PromobannerItemProps) => {
  const { model } = props;
  const { image_desktop, image_mobile, alt, description, link } = model;

  const sendMetrics = () => {
    yaMetrika.reachGoal(MetrikaGoals.IndexPage.promobanners);
  };

  const {
    props: { src: desktop },
  } = getImageProps({
    alt,
    width: 1260,
    height: 300,
    quality: 80,
    src: UrlFormatter.media(image_desktop.high),
  });

  const {
    props: { src: mobile, ...rest },
  } = getImageProps({
    alt,
    width: 750,
    height: 300,
    quality: 80,
    src: UrlFormatter.media(image_mobile.high),
  });

  return (
    <Link target="_blank" rel="noopener noreferrer nofollow" href={link} onClick={sendMetrics}>
      <picture>
        <source media="(min-width: 451px)" srcSet={desktop} />
        <source media="(max-width: 450px)" srcSet={mobile} />
        <img
          {...rest}
          alt={alt}
          className="w-full rounded-sm sm:max-h-[120px] md:max-h-[180px] lg:max-h-[230px] xl:max-h-[300px]"
        />
      </picture>
      {description && description.length > 3 ? (
        <ReText size="xs" color="muted-foreground">
          {description}
        </ReText>
      ) : null}
    </Link>
  );
};

export const Promobanners = () => {
  const { data } = useSuspenseQuery(v2FunctionsBannerSlidersListOptions({ client }));
  if (!data.length) return null;

  return (
    <HomeSection className="mt-8 px-2">
      <Carousel
        opts={{
          align: 'center',
          loop: true,
        }}
        plugins={[
          Autoplay({
            playOnInit: true,
            delay: 5000,
            stopOnMouseEnter: true,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="!ml-0 flex w-full gap-2">
          {shuffleArray(data).map((model) => (
            <CarouselItem
              key={model.id}
              className="!basis-none relative w-full grow-0 !px-0 select-none"
            >
              <PromobannerItem model={model} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </HomeSection>
  );
};
