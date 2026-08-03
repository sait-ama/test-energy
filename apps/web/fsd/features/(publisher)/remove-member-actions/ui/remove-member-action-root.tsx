import { useState } from 'react';
import { useParams } from 'next/navigation';

import Trash from '@re/ui-kit/icons/trash';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@re/ui-kit/ui/alert-dialog';
import { Button } from '@re/ui-kit/ui/button';

import { usePublisherQuery } from '~entities/publisher/model/queries';
import { RemoveMemberActionButton } from '~features/(publisher)/remove-member-actions/ui/remove-member-action-button';

export const RemoveMemberAction = ({
  memberId,
  memberName,
  disabled,
}: {
  disabled?: boolean;
  memberName: string;
  memberId: number;
}) => {
  const [open, setOpen] = useState(false);
  const { dir } = useParams();
  const { data: { props } = {} } = usePublisherQuery({ variables: { params: { dir } } });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger disabled={disabled && props?.is_member} asChild>
        <Button size="sm" circle variant="destructive">
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Удаление участника {memberName}</AlertDialogTitle>
        <div className="flex gap-4">
          <AlertDialogCancel className="px-4">Отмена</AlertDialogCancel>
          <AlertDialogAction asChild>
            <RemoveMemberActionButton userId={memberId} />
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
