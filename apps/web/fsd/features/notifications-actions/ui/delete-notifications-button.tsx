import { type MouseEvent } from 'react';
import { useParams } from 'next/navigation';

import Trash from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';

import { useDeleteNotifications } from '~entities/notification/model/mutations';
import { useNotificationsStatus, useNotificationStore } from '~entities/notification/model/store';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';

export const DeleteNotificationsButton = () => {
  const params = useParams();

  const { value } = useNotificationsStatus();

  const { mutateAsync } = useDeleteNotifications({ query: { status: value, type: params.dir } });

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
      size="sm"
      variant="destructive"
      circle
    >
      <Trash />
    </Button>
  );
};

interface DeleteNotificationsButtonProps {
  id: NumberIsomorphic;
}

export const DeleteNotificationsGroupButton = (props: DeleteNotificationsButtonProps) => {
  const { id } = props;
  const params = useParams();

  const { value } = useNotificationsStatus();

  const { mutateAsync } = useDeleteNotifications({ query: { status: value, type: params.dir } });

  const { setSelectedIds } = useNotificationStore();

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    try {
      await mutateAsync({ type: params.dir, notification: 'all', title_id: id });
      setSelectedIds([]);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Button onClick={handleSubmit} variant="ghost">
      Удалить ветку
    </Button>
  );
};
