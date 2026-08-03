import { Payment } from '@re/api/generated/types.gen';
import Coin from '@re/ui-kit/icons/coin';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';
import { RichText } from '~shared/ui/rich-text';

const Statuses: Record<number, 'CANCELED' | 'SUCCESS' | 'WAITING'> = {
  0: 'CANCELED',
  1: 'SUCCESS',
  2: 'WAITING',
};
export type Mappers = {
  [k in keyof Payment]?: Record<string, string>;
};
export const getColumns = (
  t: (...args: any[]) => string,
  mappers: Mappers = {},
  excludeColumns: string[] = []
) => {
  return (
    [
      {
        id: 'amount',
        accessorKey: 'sum',
        header: () => {
          return (
            <div className="justify-centere flex h-12 w-full items-center gap-4 self-center text-center">
              <ReText align="center" className="flex w-fit items-center gap-4 self-center">
                {t('words.amount')}
              </ReText>
              <Coin />
            </div>
          );
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.original.sum || '0');

          return (
            <ReText
              size="sm"
              align="left"
              className={cn(amount < 0 ? 'text-destructive' : 'text-success self-center')}
            >
              {amount.toFixed(2)}
            </ReText>
          );
        },
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: () => {
          return (
            <div className="fit-content flex h-12 items-center justify-center gap-3 self-center">
              <ReText align="center" className="w-full">
                {t('words.type')}
              </ReText>
            </div>
          );
        },
        cell: ({ row }) => {
          return (
            <ReText align="center" size="sm" className="w-full">
              {mappers?.['type']?.[row?.original?.type] ?? t(`filters.type.${row?.original?.type}`)}
            </ReText>
          );
        },
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => {
          return (
            <div className="flex h-12 items-center gap-3 self-center">
              <ReText align="center" className="w-full">
                {t('words.status')}
              </ReText>
            </div>
          );
        },
        cell: ({ row }) => {
          const status = row.original.status;
          const finalStatus = Statuses[status];
          const statusColor =
            finalStatus === 'CANCELED'
              ? 'text-destructive'
              : finalStatus === 'SUCCESS'
                ? 'text-success'
                : finalStatus === 'WAITING'
                  ? 'text-warning'
                  : 'text-foreground';

          return (
            <ReText align="center" size="sm" className={cn('w-full', statusColor)}>
              {mappers?.['status']?.[status] ?? t(`filters.status.${status}`)}
            </ReText>
          );
        },
      },

      {
        id: 'date',
        accessorKey: 'date',
        header: () => {
          return (
            <div className="flex h-12 w-full items-center gap-3 self-center pl-1">
              <ReText align="center" className="w-full">
                {t('words.date')}
              </ReText>
            </div>
          );
        },
        cell: ({ row }) => {
          return (
            <ReText align="center" size="sm" className="w-full">
              {row.original.date ? dayjs(row.original.date).format('DD.MM.YYYY') : '-'}
            </ReText>
          );
        },
      },
      {
        id: 'comment',
        accessorKey: 'comment',
        header: () => {
          return (
            <ReText className="h-12 self-center" align="center">
              {t('words.comment')}
            </ReText>
          );
        },
        cell: ({ row }) => {
          return (
            <Dialog>
              <DialogTrigger
                disabled={!row.original.comment}
                className={cn('w-full rounded-md', { 'hover:bg-muted': !!row.original.comment })}
              >
                <RichText lineClamp={1} className="self-center text-center text-sm">
                  {sanitizeSync(row.original.comment) || '-'}
                </RichText>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader className="m-auto">{t('words.comment-title')}</DialogHeader>
                <RichText className="self-center text-center text-sm">
                  {sanitizeSync(row.original.comment)}
                </RichText>
              </DialogContent>
            </Dialog>
          );
        },
      },
    ] as ColumnDef<Payment>[]
  ).filter((it) => !excludeColumns.includes(it.id ?? ''));
};
