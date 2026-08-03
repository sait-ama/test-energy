import { TicketHistory } from '@re/api/generated/types.gen';
import TicketIcon from '@re/ui-kit/icons/ticket';
import { ReText } from '@re/ui-kit/ui/text';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

export const getColumns = (t: (...args: any[]) => string, excludeColumns: string[] = []) => {
  return (
    [
      {
        id: 'count',
        accessorKey: 'count',
        header: () => {
          return (
            <div className="flex h-12 w-full items-center self-center">
              <ReText align="center" className="flex w-full items-center gap-4">
                {t('words.count')}
                <TicketIcon className="inline" />
              </ReText>
            </div>
          );
        },
        cell: ({ row }) => {
          return (
            <ReText size="sm" align="center">
              {t('one.count', {
                count: row.original.ticket.sum_left,
                total: row.original.ticket.sum,
              })}
            </ReText>
          );
        },
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: () => {
          return (
            <div className="flex h-12 items-center gap-3 self-center">
              <ReText align="center" className="w-full">
                {t('words.gift_type')}
              </ReText>
            </div>
          );
        },
        cell: ({
          row: {
            original: {
              action_type: { name },
            },
          },
        }) => {
          return (
            <ReText align="center" size="sm" className="w-full">
              {name}
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
        cell: ({
          row: {
            original: { ticket: { date: value } = {} },
          },
        }) => {
          return (
            <ReText align="center" size="sm" w-full>
              {!value ? '-' : dayjs(value).format('DD.MM.YYYY')}
            </ReText>
          );
        },
      },
      {
        id: 'date_expire',
        accessorKey: 'date_expire',
        header: () => {
          return (
            <div className="flex h-12 items-center gap-3 self-center pl-1">
              <ReText align="center">{t('words.date_expire')}</ReText>
            </div>
          );
        },
        cell: ({
          row: {
            original: { ticket: { date_expire: value } = {} },
          },
        }) => {
          return (
            <ReText align="center" size="sm">
              {value ? dayjs(value).format('DD.MM.YYYY') : '∞'}
            </ReText>
          );
        },
      },
    ] satisfies ColumnDef<TicketHistory>[]
  ).filter((it) => !excludeColumns.includes(it.id));
};
