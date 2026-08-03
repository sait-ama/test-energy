import type { ReactNode } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';

import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface DeleteBookmarkTriggerProps {
  children: ReactNode;
  titleId: number;
}

export const DeleteBookmarkTrigger = (props: DeleteBookmarkTriggerProps) => {
  const { titleId, children } = props;
  const { mutateAsync } = use();

  const handleDelete = async () => {
    const toast = await importToastAsync();

    try {
      await mutateAsync({ titleId });
      toast.success('Произведение успешно удалено из закладок');
    } catch (e: unknown) {
      logger.error(e);

      toast.error(`Не удалось удалить тайтл из закладок: ${e?.detail?.message}`);
    }
  };

  return <Slot onClick={handleDelete}> {children}</Slot>;
};
