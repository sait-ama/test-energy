import type { MouseEventHandler, ReactNode } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';

import { useDeleteUserHistory } from '~entities/user/model/mutations';
import type { DeleteUserHistoryRequestSchema } from '~shared/api/models/user';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import type { ConfirmationParams } from '~shared/lib/submit-action/use-submit-action';
import { useGetConfirmation } from '~shared/lib/submit-action/use-submit-action';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface DeleteHistoryTriggerProps {
  children: ReactNode;
  confirmation?: ConfirmationParams;
  data: DeleteUserHistoryRequestSchema['ids'];
  onSuccess?: () => void;
}

export const DeleteHistoryTrigger = (props: DeleteHistoryTriggerProps) => {
  const { children, confirmation, data, onSuccess } = props;
  const { mutateAsync } = useDeleteUserHistory();
  const confirmAction = useGetConfirmation();
  const session = useSession()!;

  const handleClick: MouseEventHandler<HTMLElement> = async () => {
    const toast = await importToastAsync();

    try {
      const confirmed = await confirmAction(confirmation);
      if (!confirmed) return;

      await mutateAsync({
        data: { ids: data },
        params: { userId: session.id },
      });
      onSuccess?.();
      toast.success('Данные успешно удалены');
    } catch (e: unknown) {
      logger.error(e);
      toast.error('Произошла ошибка при удалении истории');
    }
  };

  return <Slot onClick={handleClick}>{children}</Slot>;
};
