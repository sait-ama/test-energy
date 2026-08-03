'use client';

import { memo, Suspense } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import ArrowLeftIcon from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import { Routing } from '~shared/config/routing';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

import { useCurrentPageParams } from '../model/hooks';
import { TitlePromoStatisticsStoreProvider } from '../model/store';

import { TitlePromoDetailActions } from './title-promo-detail-actions';
import { TitlePromoDetailCard } from './title-promo-detail-card';
import { TitlePromoDetailCharts } from './title-promo-detail-chart';
import { TitlePromoDetailStats } from './title-promo-detail-stats';
import { TitlePromoDetailTabs } from './title-promo-detail-tabs';

const BackButton = memo(() => {
  const tReusable = useTranslations('reusable.actions');
  const params = useCurrentPageParams();

  return (
    <Button asChild startIcon={<ArrowLeftIcon />} className="self-start" variant="ghost">
      <Link href={Routing.Publisher.detail({ params: { dir: params.dir, tab: 'advertisement' } })}>
        {tReusable('go_back')}
      </Link>
    </Button>
  );
});

export const TitlePromoDetailPage = memo(() => (
  <div className="flex flex-col">
    <BackButton />
    <QuerySuspenseContainer
      fallback={<div className="bg-secondary mt-2 h-46 w-full animate-pulse rounded-md" />}
    >
      <TitlePromoDetailCard className="mt-2" />
    </QuerySuspenseContainer>
    <QuerySuspenseContainer
      fallback={<div className="bg-secondary mt-7 h-100 w-full animate-pulse rounded-md" />}
    >
      <TitlePromoStatisticsStoreProvider>
        <ScrollArea>
          <div className="mt-7 flex justify-between">
            <Suspense
              fallback={<div className="bg-secondary h-10 w-24 animate-pulse rounded-md" />}
            >
              <TitlePromoDetailTabs />
            </Suspense>
            <Suspense
              fallback={<div className="bg-secondary h-10 w-24 animate-pulse rounded-md" />}
            >
              <TitlePromoDetailActions />
            </Suspense>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Suspense
          fallback={<div className="bg-secondary mt-2 h-57 w-full animate-pulse rounded-md" />}
        >
          <TitlePromoDetailStats className="mt-5" />
        </Suspense>
        <Suspense
          fallback={<div className="bg-secondary mt-2 h-57 w-full animate-pulse rounded-md" />}
        >
          <TitlePromoDetailCharts className="mt-4" />
        </Suspense>
      </TitlePromoStatisticsStoreProvider>
    </QuerySuspenseContainer>
  </div>
));
