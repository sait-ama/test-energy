'use client';

import Star from '@re/ui-kit/icons/star';
import { ReText } from '@re/ui-kit/ui/text';

import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { Expandable } from '~shared/ui/expandable';
import { RatingBar } from '~shared/ui/ratings-sepating/rating-bar';
import { ReadingStatus, statusIndex } from '~shared/ui/ratings-sepating/reading-status';

export function RatingsCard() {
  const { data: title } = useCurrentPageSuspenseTitleDetail();

  const totalInLists =
    title?.stats?.bookmarks?.reduce((acc, cur) => {
      acc += cur.count;
      return acc;
    }, 0) ?? 0;

  const ratingData = Array.from({ length: 10 }, (_, i) => i + 1)
    .reverse()
    .map((rating) => [rating.toString(), +(title?.stats?.ratings?.[rating] || 0)]);

  if (!totalInLists) return null;

  return (
    <div className="bg-secondary dark:bg-background/50 flex flex-col gap-4 rounded-md p-4">
      <div className="w-full">
        <ReText component="h3" size="lg" weight="semibold">
          Статистика
        </ReText>
        {title.count_rating > 99 ? (
          <div className="flex items-center gap-1">
            <ReText weight="medium" color="muted-foreground" size="sm">
              Рейтинг за последнее время: {title?.fresh_rating}
            </ReText>
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
          </div>
        ) : null}
      </div>

      <Expandable
        maxHeight={92}
        withGradient
        renderContent={(ref) => {
          return (
            <div ref={ref} className="rounded-md py-2">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  {ratingData.map(([rating, count], index) => (
                    <RatingBar
                      key={rating}
                      count={count}
                      percentage={(count / (title.count_rating || 1)) * 100}
                      delay={index * 100}
                      rating={rating}
                      isEmpty={count === 0}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  {title?.stats?.bookmarks
                    ?.sort((a, b) => statusIndex[a.name] - statusIndex[b.name])
                    ?.map(({ name: status, count }, index) => (
                      <ReadingStatus
                        status={status}
                        count={count}
                        key={`${status}-${index}`}
                        delay={(index + ratingData.length) * 100}
                        percentage={(count / totalInLists) * 100}
                      />
                    ))}
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
