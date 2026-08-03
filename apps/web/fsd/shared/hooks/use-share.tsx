import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const useShare = (url: string | undefined) => {
  const t = useTranslations('reusable.actions');

  const onShare = useCallback(async () => {
    if (!url) return;
    const toast = await importToastAsync();

    try {
      const instance = new URL(window.location.href);

      instance.pathname = url;

      await navigator.clipboard.writeText(instance.toString());
      toast.success(t('copy-link-success'));
    } catch (e: unknown) {
      logger.error(e);
      toast.error('copy-link-error');
    }
  }, [url]);

  return {
    onShare,
  };
};
