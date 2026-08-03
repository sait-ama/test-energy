import { lazy, memo, Suspense } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';

import { cn } from '~shared/utils/cn';

import { useCurrentPagePublisherQuery } from '../model/hooks';

const TitlePromoListActionsAddTitle = lazy(
  /* webpackChunkName: "TitlePromoListActionsAddTitle" */ () =>
    import('~features/publisher-add-ad-table-title/ui/publisher-add-ad-table-title-button').then(
      (v) => ({
        default: v.PublisherAddAdTableTitleButton,
      })
    )
);

const TitlePromoListActionsBuyDays = lazy(
  /* webpackChunkName: "TitlePromoListActionsBuyDays" */ () =>
    import('~features/publisher-buy-add-balance/ui/publisher-buy-add-balance').then((v) => ({
      default: v.PublisherBuyAdDaysButton,
    }))
);

const TitlePromoListActionsBalance = () => {
  const t = useTranslations('publisher.segments.profile-layout.advertisement.sections');
  const { data: publisher } = useCurrentPagePublisherQuery();

  return (
    <Button color="secondary">
      {t('balance', { balance: publisher?.promo_days_balance || 0 })}
    </Button>
  );
};

export interface TitlePromoListActionsProps {
  className?: string;
}

export const TitlePromoListActions = memo(({ className }: TitlePromoListActionsProps) => (
  <div className={cn('flex items-center justify-between gap-3', className)}>
    <div className="flex items-center gap-3">
      <Suspense fallback={<div className="bg-secondary h-9 w-25 animate-pulse rounded-md" />}>
        <TitlePromoListActionsBalance />
      </Suspense>
      <Suspense fallback={<div className="bg-secondary h-9 w-25 animate-pulse rounded-md" />}>
        <TitlePromoListActionsBuyDays />
      </Suspense>
    </div>
    <div className="flex items-center gap-3">
      <Suspense fallback={<div className="bg-secondary h-9 w-25 animate-pulse rounded-md" />}>
        <TitlePromoListActionsAddTitle />
      </Suspense>
    </div>
  </div>
));
