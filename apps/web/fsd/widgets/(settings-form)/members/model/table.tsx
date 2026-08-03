'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import type { ColumnDef } from '@tanstack/react-table';

import type { ClubMember } from '@re/api/generated/types.gen';
import { ReText } from '@re/ui-kit/ui/text';

import { ROLES } from '~entities/guild/lib/access';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { ManageMember } from '~features/(guild-manage)/ui/manage-member';
import { RemoveMember } from '~features/(guild-manage)/ui/remove-member';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';

export const columns: ColumnDef<ClubMember>[] = [
  {
    id: 'user',
    accessorKey: 'user',
    header: () => <div className="w-fit">Участник</div>,
    // filterFn: usernameFilter,
    cell: ({ row }) => {
      return (
        <Link
          className="flex items-center gap-2 md:gap-4"
          href={Routing.User.detail({
            params: { id: row.original.user.id, tab: 'about' },
          })}
        >
          <UserAvatar
            alt={row.original.user.username}
            avatarSrc={row.original.user.avatar.mid}
            frameSrc={row.original.user.frame.high}
            size="md"
          />
          <ReText>{row.original.user.username.slice(0, 10)}</ReText>
        </Link>
      );
    },
  },
  {
    id: 'role',
    accessorKey: ' role',
    header: ({ column }) => <div className="m-auto w-fit">Роль</div>,
    cell: ({ row }) => {
      const t = useTranslations('pages.guild.members.roles');
      return <ReText className="text-center">{t(row.original?.role ?? 'member')}</ReText>;
    },
  },
  {
    id: 'coins_spent',
    accessorKey: 'coins_spent',
    header: () => <div className="m-auto w-fit">Потрачено на буст</div>,
    cell: ({ row }) => {
      return <ReText className="text-center">{row.original?.coins_spent}</ReText>;
    },
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header: ({ column }) => <div className="ml-auto w-fit">Действия</div>,
    cell: ({ row }) => {
      const curId = useSession((v) => v?.id);
      const isMe = curId === row.original.user.id;
      const isCreator = row.original.role === ROLES.CREATOR;

      return (
        <span className="ml-auto flex w-fit justify-end gap-2">
          {isMe || isCreator ? (
            <ReText className="m-auto w-fit" align="center">
              -
            </ReText>
          ) : (
            <>
              <ManageMember member={row.original} />
              <RemoveMember user={row.original.user} />
            </>
          )}
        </span>
      );
    },
  },
];
