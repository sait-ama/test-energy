'use client';

import { Suspense } from 'react';
import Link from 'next/link';

import Bookmarks from '@re/ui-kit/icons/bookmarks';
import ExternalLink from '@re/ui-kit/icons/external-link';
import Eye from '@re/ui-kit/icons/eye';
import Like from '@re/ui-kit/icons/like';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { defineRatingColor } from '~entities/title/model/utils';
import { RateTitle } from '~features/rate-title/ui/rate-title';
import { InfoModalType } from '~shared/api/models/info-modal';
import { Routing } from '~shared/config/routing';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { TestProps } from '~shared/lib/test/utils/test-props';
import {
  EntityLayoutStatsItemShort,
  EntityLayoutStatsShortRoot,
  EntityLayoutSubtitle,
  EntityLayoutTitle,
} from '~shared/ui/entity-layout';
import { linkBaseVariants } from '~shared/ui/link-base';
import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

import { useCurrentPageSuspenseTitleDetail } from '../model/queries';

interface StatsProps {
  className?: string;
}

const Stats = ({ className }: StatsProps) => {
  const { data } = useCurrentPageSuspenseTitleDetail();

  return (
    <EntityLayoutStatsShortRoot className={cn('-mx-2 items-center', className)}>
      <EntityLayoutStatsItemShort withBackground={false} icon={<Like />}>
        Лайков: {getAbbreviatedNumber(data?.total_votes)}
      </EntityLayoutStatsItemShort>
      <EntityLayoutStatsItemShort withBackground={false} icon={<Eye />}>
        Просмотров: {getAbbreviatedNumber(data?.total_views)}
      </EntityLayoutStatsItemShort>
      <EntityLayoutStatsItemShort withBackground={false} icon={<Bookmarks />}>
        Закладок: {getAbbreviatedNumber(data?.count_bookmarks)}
      </EntityLayoutStatsItemShort>
    </EntityLayoutStatsShortRoot>
  );
};

interface MainNameProps {
  className?: string;
}

const MainName = ({ className }: MainNameProps) => {
  const contentType = useContentType();
  const { data } = useCurrentPageSuspenseTitleDetail();

  return (
    <div className={cn('flex flex-col items-center gap-1 md:items-start', className)}>
      <EntityLayoutSubtitle className="mx-1 flex flex-wrap items-center gap-1 max-sm:justify-center">
        <Link
          prefetch={false}
          href={Routing.Title.catalog({
            params: { content: contentType },
            query: { types: data.type.id },
          })}
          className={cn(
            linkBaseVariants(),
            'text-muted-foreground hover:text-primary flex items-center gap-0.5'
          )}
        >
          {data.type.name}
          <ExternalLink className="h-3 w-3" />
        </Link>
        <span>·</span>
        {data?.issue_year ? (
          <Link
            prefetch={false}
            href={Routing.Title.catalog({
              params: { content: contentType },
              query: {
                issue_year: `${data.issue_year}-${data.issue_year}`,
              },
            })}
            className={cn(
              linkBaseVariants(),
              'text-muted-foreground hover:text-primary flex items-center gap-0.5'
            )}
          >
            {data.issue_year}
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          data?.issue_year
        )}
      </EntityLayoutSubtitle>
      <div className="flex gap-2">
        <EntityLayoutTitle className="-mx-1">{data?.main_name}</EntityLayoutTitle>
        {!data.uploaded ? (
          <Badge color="secondary" className="self-end">
            Скрыт
          </Badge>
        ) : null}
      </div>
    </div>
  );
};

interface RatingProps {
  className?: string;
}

const Rating = ({ className }: RatingProps) => {
  const checkLogged = useLoggedCheck();
  const { open: openInfoModal, close } = useInfoModal();
  const { data } = useCurrentPageSuspenseTitleDetail();

  const showRating = data!.count_rating > 99;

  if (!data?.count_chapters) return null;

  const handleClick = () => {
    openInfoModal({
      type: InfoModalType.CUSTOM,
      content: <RateTitle onRate={close} />,
      contentProps: {
        className: 'max-w-lg border-none p-0',
      },
      srOnly: 'Оценка произведения',
    });
  };

  return (
    <div className="flex w-full flex-row items-center justify-center gap-2 [grid-area:rating] md:flex-col md:items-end md:justify-center">
      {showRating ? (
        <div>
          <ReText
            className={cn(
              'text-foreground flex flex-nowrap items-center gap-2 rounded-md text-xl leading-none font-bold select-none'
            )}
            style={{
              color: `hsl(var(${defineRatingColor(data!.avg_rating)}))`,
            }}
          >
            {data!.avg_rating}
          </ReText>
        </div>
      ) : (
        <ReText size="xs" align="end" color="muted-foreground">
          формируется
        </ReText>
      )}

      <ReText size="xs" color="muted-foreground" className="text-nowrap">
        {data!.count_rating} голосов
      </ReText>
      <Button
        onClick={checkLogged(handleClick)}
        color="secondary"
        size="xs"
        {...TestProps.id('rating_btn')}
      >
        {data?.rated ? `Оценка: ${data?.rated}` : 'Оценить'}
      </Button>
    </div>
  );
};

export interface TitleHeaderBlockProps {
  className: string;
}

export const TitleHeaderBlock = ({ className }: TitleHeaderBlockProps) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-[1fr_min-content] gap-2 [grid-template-areas:'title_title''stats_stats''rating_rating'] sm:[grid-template-areas:'title_title''stats_rating'] xl:[grid-template-areas:'title_rating''stats_rating']",
        className
      )}
    >
      <Suspense
        fallback={
          <div
            className={cn('flex w-full flex-col items-center justify-start gap-2.5 md:items-start')}
          >
            <Skeleton
              className="h-5 w-[120px]"
              containerClassName="w-full max-sm:justify-center items-center flex"
            />
            <Skeleton
              className="h-6 w-1/2"
              containerClassName="w-full max-sm:justify-center items-center flex"
            />
            <Skeleton
              className="h-5 w-[240px]"
              containerClassName="w-full max-sm:justify-center items-center flex"
            />
          </div>
        }
      >
        <MainName className="[grid-area:title]" />
      </Suspense>
      <Suspense fallback={null}>
        <Stats className="[grid-area:stats]" />
      </Suspense>
      <Suspense fallback={null}>
        <Rating className="justify-center [grid-area:rating]" />
      </Suspense>
    </div>
  );
};
