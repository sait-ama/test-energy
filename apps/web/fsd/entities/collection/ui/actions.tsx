import { memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { useMutation } from '@tanstack/react-query';

import Trash from '@re/ui-kit/icons/trash';

import { InfoModalTrigger } from '~features/info-modal';
import { client } from '~shared/api/client';
import { v2TitlesCollectionsDestroyMutation } from '~shared/api/generated/tanstack';
import { InfoModalType } from '~shared/api/models/info-modal';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const RemoveCollection = memo(
  ({ collectionId, onSuccess }: { collectionId: number; onSuccess?: () => void }) => {
    const { mutateAsync, isPending } = useMutation({
      ...v2TitlesCollectionsDestroyMutation({ client, cache: 'no-store' }),
      onSuccess,
    });
    const t = useTranslations('pages.collections.actions.remove.do');
    const onRemove = useCallback(async () => {
      try {
        await mutateAsync({ path: { id: collectionId } });
        const toast = await importToastAsync();
        toast.success(t('submit'));
      } catch (e) {
        logger.error(e);
        await resolveErrorAsync(e);
      }
    }, [collectionId]);
    return (
      <InfoModalTrigger
        size="sm"
        circle
        variant="outline"
        options={{
          title: t('alert'),
          onAction: onRemove,
          type: InfoModalType.ALERT,
          actionButtonProps: {
            loading: isPending,
            variant: 'destructive',
          },
        }}
      >
        <Trash color="destructive" size={20} />
      </InfoModalTrigger>
    );
  }
);
