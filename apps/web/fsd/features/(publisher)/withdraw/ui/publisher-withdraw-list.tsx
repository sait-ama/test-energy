'use client';
import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';

import Comments from '@re/ui-kit/icons/comments';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@re/ui-kit/ui/hover-card';
import { Spinner } from '@re/ui-kit/ui/spinner';
import { ReText } from '@re/ui-kit/ui/text';
import type { ColumnDef } from '@tanstack/react-table';
import DayJS from 'dayjs';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useCurPublisherDeps } from '~entities/publisher/model/context';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { useWithDrawListQuery } from '~features/(publisher)/withdraw/model/queries';
import { CancelWithDrawTrigger } from '~features/(publisher)/withdraw/ui/cancel-withdraw/cancel-with-draw-trigger';
import { CancelWithdraw } from '~features/(publisher)/withdraw/ui/cancel-withdraw/cancel-withdraw';
import type { PublisherWithDrawSchema } from '~shared/api/models/publisher';
import { Routing } from '~shared/config/routing';
import { EmptyView } from '~shared/ui/empty-view';
import { TableSortButton } from '~shared/ui/table';
import { VirtualizedDataTable } from '~shared/ui/virtualized-data-table';
import { noop } from '~shared/utils/noop';

const HoverCardCustom = ({ content, trigger }: { content: ReactNode; trigger: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <div
          onClick={() => {
            setOpen((v) => !v);
          }}
        >
          {trigger}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto" asChild>
        <div>{open && content}</div>
      </HoverCardContent>
    </HoverCard>
  );
};

const columns: ColumnDef<PublisherWithDrawSchema>[] = [
  {
    id: 'user',
    aggregatedCell: 'user',
    header: () => (
      <div className="flex h-12 items-center gap-3 self-center pl-1">
        <ReText align="center">Актор</ReText>
      </div>
    ),
    cell: ({
      row: {
        original: {
          user: { username, id, avatar, frame },
        },
      },
    }) => (
      <Link
        prefetch={false}
        href={Routing.User.detail({ params: { id, tab: 'about' } })}
        className="flex items-center gap-2"
      >
        <UserAvatar alt={username} avatarSrc={avatar.mid} frameSrc={frame.high} size="md" />
        <ReText>{username.slice(0, 10)}</ReText>
      </Link>
    ),
  },
  {
    id: 'sum',
    accessorKey: 'sum',
    cell: ({
      row: {
        original: { sum },
      },
    }) => (
      <ReText className="flex h-full w-full items-center justify-center" align="center">
        {parseInt(sum, 10)}
      </ReText>
    ),
    accessorFn: (row) => (
      <ReText className="flex h-full w-full items-center justify-center">
        {parseInt(row.sum, 10)}
      </ReText>
    ),
    header: ({ column }) => (
      <TableSortButton
        isSorted={column.getIsSorted()}
        toggleSorting={column.toggleSorting}
        label="Сумма"
      />
    ),
  },

  {
    id: 'create_date',
    accessorKey: 'create_date',
    cell: ({
      row: {
        original: { create_date },
      },
    }) => {
      const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

      return (
        <ReText className="flex h-full w-full items-center justify-center">
          {DayJS(create_date).format(dateFormat)}
        </ReText>
      );
    },
    header: ({ column }) => (
      <TableSortButton
        isSorted={column.getIsSorted()}
        toggleSorting={column.toggleSorting}
        label="Создано"
      />
    ),
  },
  {
    id: 'purse',
    accessorKey: 'purse',
    cell: ({
      row: {
        original: { purse },
      },
    }) => <ReText className="flex h-full w-full items-center justify-center">{purse}</ReText>,
    header: () => (
      <div className="flex h-12 items-center justify-center gap-3 pl-1">
        <ReText className="flex h-full items-center">Карта</ReText>
      </div>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    cell: ({
      row: {
        original: { status, message, id, sum },
      },
    }) => (
      <span className="flex h-full items-center justify-center gap-2">
        <ReText>{status}</ReText>

        {message && <HoverCardCustom trigger={<Comments />} content={<ReText>{message}</ReText>} />}
        {status === 'В очереди' && (
          <CancelWithdraw model={{ id, sum }}>
            {(cancel, isPending) => <CancelWithDrawTrigger onClick={cancel} loading={isPending} />}
          </CancelWithdraw>
        )}
      </span>
    ),
    header: () => (
      <div className="flex h-12 items-center gap-3 self-center pl-1">
        <ReText align="center">Статус</ReText>
      </div>
    ),
  },
  {
    id: 'complete_date',
    accessorKey: 'complete_date',
    cell: ({
      row: {
        original: { complete_date },
      },
    }) => {
      const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

      return (
        <ReText className="flex size-full items-center justify-center">
          {!complete_date ? '-' : DayJS(complete_date).format(dateFormat)}
        </ReText>
      );
    },
    header: ({ column }) => (
      <TableSortButton
        isSorted={column.getIsSorted()}
        toggleSorting={column.toggleSorting}
        label="Завершено"
      />
    ),
  },
];

export const PublisherWithDrawList = () => {
  const id = useCurPublisherDeps((v) => v.publisherId);
  const {
    data: { pages = [] } = {},
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWithDrawListQuery({ variables: { params: { id }, query: { count: 15, page: 1 } } });
  const withdrawClaims = pages.flatMap((page) => page.content);
  const isEmpty = !isLoading && !pages.length;
  return (
    <div className="space-y-4">
      <ReText size="xl">Список прошлых заявок</ReText>
      {isLoading ? <Spinner /> : null}
      {/*@ts-ignore*/}
      {isEmpty && <EmptyView emoji="😞" text="заявок на выводы нет" />}
      {!isEmpty && (
        <VirtualizedDataTable
          isLoading={isLoading}
          canTrigger={!isFetchingNextPage && hasNextPage}
          isEmpty={!isLoading && !pages.length}
          columns={columns}
          data={withdrawClaims}
          onTrigger={fetchNextPage}
          setSelectedRows={noop}
        />
      )}
    </div>
  );
};
