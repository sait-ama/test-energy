import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { MomentSchema } from '~shared/api/models/inventory';
import { Routing } from '~shared/config/routing';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const useShareMoment = (moment?: MomentSchema) => {
  const t = useTranslations('reusable.actions');

  const onShare = useCallback(async () => {
    if (!moment) return;
    const toast = await importToastAsync();

    try {
      const url = new URL(window.location.href);

      url.pathname = Routing.Moment.detail({ params: { dir: moment.dir! } });

      await navigator.clipboard.writeText(url.toString());
      toast.success(t('copy-link-success'));
    } catch (e: unknown) {
      logger.error(e);
    }
  }, [moment]);

  return {
    onShare,
  };
};
