'use client';

import { useParams } from 'next/navigation';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useTitleRelationsSuspenseQuery } from '~entities/title/model/queries';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~shared/ui/carousel';
import { Section, SectionTitle } from '~shared/ui/section';

import type { TitleDetailPageParams } from '../../../model/type';

export interface RelatedTitlesSectionProps {
  className?: string;
}

export const RelatedTitlesSection = (props: RelatedTitlesSectionProps) => {
  const { className } = props;

  const params = useParams<TitleDetailPageParams>();

  const { data } = useTitleRelationsSuspenseQuery({
    variables: {
      params,
    },
  });
  const isEmpty = !data?.titles?.length;
  if (isEmpty) return null;

  return (
    <Section className={cn('border-none py-4 max-sm:px-0', className)}>
      <SectionTitle className="max-sm:px-4">Связанные произведения</SectionTitle>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
      >
        <CarouselContent className="max-sm:pl-2">
          {data?.titles.map((item, index) => (
            <CarouselItem
              key={index}
              className="basis-[95%] sm:basis-[65%] md:basis-[55%] lg:basis-[45%]"
            >
              <HorizontalTitleCard
                size="xs"
                model={item.title}
                subtitle={
                  <ReText size="sm" color="muted-foreground">
                    {item.type.name ?? 'Продолжение'}
                  </ReText>
                }
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </Section>
  );
};
