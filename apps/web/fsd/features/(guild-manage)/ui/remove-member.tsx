import { v2ClubsKickMembersCreateMutation } from '@re/api/generated/@tanstack/react-query.gen';
import Trash from '@re/ui-kit/icons/trash';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@re/ui-kit/ui/alert-dialog';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';

import { ClubKeys } from '~entities/guild/api/query-keys';
import { useDirDepClub } from '~entities/guild/model/hooks';
import { client } from '~shared/api/client';
import type { UserSchemaFragment } from '~shared/api/models/user';
import { useOptimisticMutation } from '~shared/api/react-query';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const RemoveMember = ({
  user,
  className,
  loading,
  variant,
  circle,
  ...other
}: { user: UserSchemaFragment } & ButtonProps) => {
  const dir = useDirDepClub();
  const { mutateAsync, isPending } = useOptimisticMutation({
    invalidateV2: ClubKeys.clubsRetrieveQueryKey({ path: { dir } }),
    ...v2ClubsKickMembersCreateMutation({ client }),
  });

  const toggleDelete = async () => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({ path: { dir }, body: { user_ids: [user.id] } });
      toast.success('Участник выгнан');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className={className}
          {...other}
          loading={loading || isPending}
          circle={circle ?? true}
          variant={variant ?? 'flat'}
          color="danger"
        >
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Нажав продолжить, вы выгоните участника {user.username}</AlertDialogTitle>
        <div className="flex gap-4">
          <AlertDialogCancel className="px-4">Отмена</AlertDialogCancel>
          <AlertDialogAction>
            <Button loading={isPending} onClick={toggleDelete}>
              Продолжить
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
