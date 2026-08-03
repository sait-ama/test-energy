'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';

import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import type { ColumnDef } from '@tanstack/react-table';

import { UserAvatar } from '~entities/user/ui/user-avatar';
import { MemberPrivilegesActionWithForm } from '~features/(publisher)/forms/member-privileges/ui/member-privileges-form-root';
import { RemoveMemberAction } from '~features/(publisher)/remove-member-actions/ui/remove-member-action-root';
import type { PublisherMembersTable } from '~shared/api/models/publisher';
import { RoleMembers } from '~shared/api/models/publisher';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';
import { usePublisherPrivilegesRecord } from '~widgets/(publisher-settings)/members/model/hooks';

export const usePublisherMemberColumns = () => {
  const data = usePublisherPrivilegesRecord();
  const sessionId = useSession((v) => v?.id);

  return useMemo(
    () =>
      [
        {
          id: 'user',
          accessorKey: 'name',
          header: 'Пользователь',
          cell: ({ row }) => (
            <Link
              className="flex flex-1 items-center gap-2"
              href={Routing.User.detail({
                params: { id: row.original.user.id, tab: 'about' },
              })}
            >
              <UserAvatar
                alt={row.original.user.username}
                frameSrc={row.original.user.frame.high ?? ''}
                avatarSrc={row.original.user.avatar.mid ?? ''}
                size="md"
              />

              <ReText size="sm">
                {sessionId === row.original.user.id ? 'Вы' : row.original.user.username}
              </ReText>
            </Link>
          ),
        },
        {
          id: 'role',
          accessorKey: 'role',
          header: 'Роль',
          cell: ({ row }) => (
            <SkeletonSlot
              show={!data.record[row.original.role]}
              render={<ReText>{data.record[row.original.role]}</ReText>}
            />
          ),
        },
        {
          id: 'privileges',
          accessorKey: 'privileges',
          header: 'Права',
          cell: ({ row }) => (
            <ReText>
              {row.original.role === RoleMembers.CREATOR ? 'Все' : row.original.rights.length}
            </ReText>
          ),
        },
        {
          id: 'actions',
          accessorKey: 'actions',
          header: 'Действия',
          cell: ({ row }) => {
            const member = row.original;
            const isCreator = member.role === RoleMembers.CREATOR;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const isStaff = useSession((v) => v?.is_staff);
            const disabled = !isStaff && (member.privileges_change_immutable || isCreator);
            return (
              <span className="flex shrink gap-2">
                <MemberPrivilegesActionWithForm
                  memberRole={row.original.role}
                  memberName={row.original.user.username}
                  memberId={row.original.user.id}
                />
                <RemoveMemberAction
                  disabled={disabled}
                  memberName={row.original.user.username}
                  memberId={row.original.user.id}
                />
              </span>
            );
          },
        },
      ] satisfies ColumnDef<PublisherMembersTable>[],
    [data, sessionId]
  );
};
