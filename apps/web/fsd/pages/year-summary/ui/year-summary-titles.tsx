'use client';

import { ReText } from '@re/ui-kit/ui/text';

import { VerticalTitleCard } from '~entities/title/ui/vertical-title-card';
import { VerticalTitleCardSkeleton } from '~entities/title/ui/vertical-title-card-skeleton';
import { useYearSummaryAll } from '~entities/year-summary/model/queries';
import type { TitleSchema } from '~shared/api/models/title';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~shared/ui/carousel';
import { Container } from '~shared/ui/container';
import { Underline } from '~shared/ui/underline';

const schema = [
  { name: 'Самые популярные', field: 'views' },
  { name: 'Больше всего комментариев', field: 'comments' },
  { name: 'Самые залайканные', field: 'votes' },
  { name: 'Больше всего в закладках', field: 'bookmarks' },
] as const;

interface YearSummarySliderProps {
  name: string;
  data: TitleSchema[];
  isLoading: boolean;
}

const YearSummarySlider = ({ name, data, isLoading }: YearSummarySliderProps) => {
  return (
    <div className="w-full">
      <Underline className="mb-3">
        <ReText weight="semibold" size="xl" component="h2" className="mb-1 flex items-center">
          {name}
        </ReText>
      </Underline>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="mx-1.5 md:mr-0 md:-ml-4">
          {data.map((item) => (
            <CarouselItem
              key={item.id}
              className="basis-1/3 sm:basis-1/5 md:basis-1/6 md:pl-4 lg:basis-1/7"
            >
              {isLoading ? <VerticalTitleCardSkeleton /> : <VerticalTitleCard model={item} />}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </div>
  );
};

export const YearSummaryTitles = () => {
  const { data: summaryTitlesData, isLoading } = useYearSummaryAll({ variables: {} });

  return (
    <Container slim className="mt-5 flex flex-col gap-5">
      {schema.map(({ name, field }) => (
        <YearSummarySlider
          isLoading={isLoading}
          key={name}
          name={name}
          data={summaryTitlesData?.titles?.[field] || []}
        />
      ))}
    </Container>
  );
};
