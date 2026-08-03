import { memo, Suspense } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useCurrentChapter } from '~entities/reader/model/hooks';
import { useSimilarTitlesSuspenseInfinite } from '~entities/title/model/queries';
import { ActionButton, HorizontalSimilarCard } from '~entities/title/ui/horizontal-similar-card';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~shared/ui/carousel';
import { Underline } from '~shared/ui/underline';

export interface SimilarSliderProps {
  className?: string;
}

export const SimilarSlider = memo((props: SimilarSliderProps) => {
  const { className } = props;
  const { data: activeTitleData } = useCurrentPageSuspenseTitleDetail();
  const titleDir = activeTitleData?.dir;
  const { data: activeChapter } = useCurrentChapter();

  const isLastChapter = !activeChapter?.next?.id;
  const { data: similarTitlesData } = useSimilarTitlesSuspenseInfinite({
    variables: { params: { dir: titleDir } },
  });

  const similarList = similarTitlesData?.pages.flatMap((it) => it.results) ?? [];

  if (!isLastChapter || !similarList.length) return;

  return (
    <section className={className}>
      <header className="flex justify-between">
        <Underline>
          <ReText size="lg" weight="semibold">
            Похожие
          </ReText>
        </Underline>
        <Button color="secondary">Показать еще</Button>
      </header>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="mt-3 flex-[1_0_auto]"
      >
        <CarouselContent className="mr-2">
          {similarList?.map((item) => (
            <CarouselItem key={item.id} className="basis-full self-start sm:basis-1/2 lg:basis-1/3">
              <div className="flex">
                <HorizontalSimilarCard
                  className="border-border w-full self-start rounded-md border p-2"
                  renderAction={({ similarDir, type, rated }) => (
                    <Suspense fallback={null}>
                      <ActionButton
                        type={type}
                        titleDir={titleDir!}
                        similarDir={similarDir}
                        rated={rated}
                      />
                    </Suspense>
                  )}
                  model={item}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </section>
  );
});
