import { Button } from '@re/ui-kit/ui/button';

import { useRemoveMemberMutation } from '~features/(publisher)/remove-member-actions/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const RemoveMemberActionButton = ({ userId }: { userId: number }) => {
  const { mutateAsync, isPending } = useRemoveMemberMutation({ userId });

  const onRemove = async () => {
    try {
      await mutateAsync();
      const toast = await importToastAsync();
      toast.success('Участник успешно удалён из команды');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };
  return (
    <Button loading={isPending} onClick={onRemove} variant="destructive">
      Продолжить
    </Button>
  );
};
