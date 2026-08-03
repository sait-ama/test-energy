import { useState } from 'react';
import { useParams } from 'next/navigation';

import DotsVertical from '@re/ui-kit/icons/dots-vertical';
import TickDouble from '@re/ui-kit/icons/tick-double';
import Trash from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';

import {
  useDeleteNotifications,
  useReadNotifications,
} from '~entities/notification/model/mutations';
import { useNotificationsStatus, useNotificationStore } from '~entities/notification/model/store';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';

export const AllNotificationsDropdown = () => {
  const params = useParams();

  const { value } = useNotificationsStatus();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { mutateAsync: mutateDelete } = useDeleteNotifications({
    query: { status: value, type: params.dir },
  });

  const { mutateAsync: mutateRead } = useReadNotifications({
    query: { status: value, type: params.dir },
  });

  const { setSelectedIds } = useNotificationStore();

  const handleDeleteAll = async () => {
    try {
      await mutateDelete({ type: params.dir, notification: 'all' });
      setSelectedIds([]);
      close();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleReadAll = async () => {
    try {
      await mutateRead({ type: params.dir!, notification: 'all' });
      setSelectedIds([]);
      close();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button circle size="sm" variant="flat">
          <DotsVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col items-start gap-1">
        {value !== '1' ? (
          <Button
            className="flex w-full justify-start gap-2"
            onClick={handleReadAll}
            variant="ghost"
          >
            <TickDouble /> Прочитать все
          </Button>
        ) : null}
        <Button
          className="flex w-full justify-start gap-2"
          onClick={handleDeleteAll}
          variant="ghost"
        >
          <Trash /> Удалить прочитанные
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
