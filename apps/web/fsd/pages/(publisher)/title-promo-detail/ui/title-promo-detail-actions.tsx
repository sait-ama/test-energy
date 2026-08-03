import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { queryKeyPredicateResolver } from '@re/api/exports-core';
import { Button } from '@re/ui-kit/ui/button';
import { useMutation } from '@tanstack/react-query';

import { client } from '~shared/api/client';
import {
  v2DashboardPromoAdminStopCreateMutation,
  v2DashboardPromoAggregationRetrieveOptions,
  v2DashboardPromoRetrieveInfiniteOptions,
  v2DashboardPromoRetrieveOptions,
  v2DashboardPromoStopCreateMutation,
} from '~shared/api/generated/tanstack';
import { queryClient } from '~shared/api/react-query';
import { StaffOnly } from '~shared/lib/auth/only-staff';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useGetConfirmation } from '~shared/lib/submit-action/use-submit-action';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { cn } from '~shared/utils/cn';

import {
  useCurrentPageActivePromo,
  useCurrentPagePromo,
  useCurrentPagePublisherQuery,
  useTitlePromoDetailTabs,
} from '../model/hooks';
interface TitlePromoDetailSoftStopButtonProps {
  promoId: number;
}
const TitlePromoDetailSoftStopButton = memo(({ promoId }: TitlePromoDetailSoftStopButtonProps) => {
  const t = useTranslations('publisher-ad-title-page.content.actions');

  const { data: publisher } = useCurrentPagePublisherQuery();

  const getConfirmation = useGetConfirmation();

  const { mutateAsync: handleSoftStop } = useMutation({
    ...v2DashboardPromoStopCreateMutation({ client }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: queryKeyPredicateResolver(
          v2DashboardPromoRetrieveOptions,
          v2DashboardPromoRetrieveInfiniteOptions,
          v2DashboardPromoAggregationRetrieveOptions
        ),
      });
    },
  });

  const handleClick = async () => {
    const toast = await importToastAsync();

    try {
      await getConfirmation({ description: t('messages.promo-soft-stop-confirmation') });
      await handleSoftStop({
        path: {
          publisher_id: publisher.id,
          promo_id: promoId,
        },
      });

      toast.success(t('messages.promo-stop-success'));
    } catch (e: unknown) {
      await resolveErrorAsync(e);
      logger.error(e);
    }
  };

  return (
    <Button onClick={handleClick} color="secondary">
      {t('labels.soft-stop')}
    </Button>
  );
});

interface TitlePromoDetailHardStopButtonProps {
  promoId: number;
}

const TitlePromoDetailHardStopButton = memo(({ promoId }: TitlePromoDetailHardStopButtonProps) => {
  const t = useTranslations('publisher-ad-title-page.content.actions');

  const { data: publisher } = useCurrentPagePublisherQuery();

  const getConfirmation = useGetConfirmation();

  const { mutateAsync: handleHardStop } = useMutation({
    ...v2DashboardPromoAdminStopCreateMutation({ client }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: queryKeyPredicateResolver(
          v2DashboardPromoRetrieveOptions,
          v2DashboardPromoRetrieveInfiniteOptions,
          v2DashboardPromoAggregationRetrieveOptions
        ),
      });
    },
  });

  const handleClick = async () => {
    const toast = await importToastAsync();

    try {
      await getConfirmation({ description: t('messages.promo-hard-stop-confirmation') });
      await handleHardStop({
        path: {
          publisher_id: publisher.id,
          promo_id: promoId,
        },
      });

      toast.success(t('messages.promo-stop-success'));
    } catch (e: unknown) {
      await resolveErrorAsync(e);
      logger.error(e);
    }
  };

  return (
    <Button onClick={handleClick} color="secondary">
      {t('labels.hard-stop')}
    </Button>
  );
});

export interface TitlePromoDetailActionsProps {
  className?: string;
}

export const TitlePromoDetailActions = memo((props: TitlePromoDetailActionsProps) => {
  const { className } = props;

  const { tab } = useTitlePromoDetailTabs();

  const currentPromo = useCurrentPagePromo();
  const activePromo = useCurrentPageActivePromo();

  const promo = tab === 'all' ? activePromo : currentPromo;

  if (!promo) return null;

  return (
    <div className={cn('flex gap-2', className)}>
      {/* <Button>Добавить дни</Button> */}
      <TitlePromoDetailSoftStopButton promoId={promo.id} />
      <StaffOnly>
        <TitlePromoDetailHardStopButton promoId={promo.id} />
      </StaffOnly>
    </div>
  );
});
