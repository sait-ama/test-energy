import React, { lazy, Suspense, useCallback, useState } from 'react';
import { useParams } from 'next/navigation';

import Edit from '@re/ui-kit/icons/edit';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { Skeleton } from '@re/ui-kit/ui/skeleton';

import {
  usePublisherMemberDetailQuery,
  usePublisherQuery,
} from '~entities/publisher/model/queries';
import { RoleMembers } from '~shared/api/models/publisher';
import { useSession } from '~shared/lib/session/use-session';

const MemberPrivilegesForm = lazy(() =>
  import(
    /* webpackChunkName: "MemberPrivilegesForm" */ '~features/(publisher)/forms/member-privileges/ui/member-privileges-form'
  ).then((v) => ({
    default: v.MemberPrivilegesForm,
  }))
);
const skeletons = (
  <div className="div flex flex-col gap-4">
    {new Array(10).fill(null).map((_, key) => (
      <Skeleton key={key} className="mb-4 h-6 w-full" containerClassName="w-full" />
    ))}
  </div>
);
export const MemberPrivilegesActionWithForm = ({
  memberId,
  memberName,
  memberRole,
}: {
  memberRole: RoleMembers;
  memberName: string;
  memberId: number;
}) => {
  const [open, setOpen] = useState(false);
  const { dir } = useParams();
  const sessionId = useSession((v) => v?.id);
  const { data: { content, props: { can_manage_members = false } = {} } = {} } = usePublisherQuery(
    { variables: { params: { dir } } },
    { enabled: !!dir && open }
  );

  const { data } = usePublisherMemberDetailQuery(
    {
      variables: {
        params: {
          id: content!.id,
          memberId,
        },
      },
    },
    { enabled: !!content && open }
  );
  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Dialog modal onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={
            memberRole <= RoleMembers.CREATOR || sessionId === memberId || !can_manage_members
          }
          circle
        >
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-h-[600px] sm:max-w-md" withClose>
        <DialogTitle>Настройка прав пользователя {memberName}</DialogTitle>
        <Suspense fallback={<div className="div flex flex-col gap-4">{skeletons}</div>}>
          {data && open && (
            <MemberPrivilegesForm onSettled={close} key={memberId} memberId={memberId} />
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};
