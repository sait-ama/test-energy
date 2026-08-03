'use client';

import { useParams } from 'next/navigation';

import Check from '@re/ui-kit/icons/check';
import { Button } from '@re/ui-kit/ui/button';

import { useReadNotifications } from '~entities/notification/model/mutations';
import { useNotificationsStatus, useNotificationStore } from '~entities/notification/model/store';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';

export const ReadNotificationsButton = () => {
  const params = useParams();

  const { value } = useNotificationsStatus();

  const { mutateAsync } = useReadNotifications({ query: { status: value, type: params.dir } });

  const { selectedIds, setSelectedIds } = useNotificationStore();

  const handleSubmit = async () => {
    try {
      await mutateAsync({ type: params.dir, notification: selectedIds.join(',') });
      setSelectedIds([]);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Button
      onClick={handleSubmit}
      disabled={!selectedIds.length}
      variant="flat"
      size="sm"
      color="success"
      circle
    >
      <Check />
    </Button>
  );
};
