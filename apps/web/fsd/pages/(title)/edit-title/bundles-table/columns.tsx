'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { ReText } from '@re/ui-kit/ui/text';

import type { TitleBundlesEditTable } from '~shared/api/models/title';

export const columns: ColumnDef<TitleBundlesEditTable>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center gap-3">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
          }}
          aria-label="Select all"
        />
        <ReText>Все</ReText>
        {/*{table.getSelectedRowModel().rows.length ? <Text color="muted-foreground">Выбрано {table.getSelectedRowModel().rows.length}</Text> : null}*/}
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex h-full items-center gap-3">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
        />
        <ReText noWrap>{row.original.name}</ReText>
      </div>
    ),
    accessorKey: 'name',
    enableSorting: false,
    enableHiding: false,
    size: 200,
    minSize: 200,
  },
  {
    id: 'Цена',
    accessorKey: 'price',
    header: 'Цена',
    cell: ({ row }) => <ReText>{row.original.price}</ReText>,
  },
  {
    id: 'Доход сайта',
    accessorKey: 'site_income',
    header: 'Доход сайта',
    cell: ({ row }) => <ReText>{row.original.site_income || '---'}</ReText>,
  },
  {
    id: 'Доход издателя',
    accessorKey: 'publisher_income',
    header: 'Доход издателя',
    cell: ({ row }) => <ReText>{row.original.publisher_income || '---'}</ReText>,
  },
  {
    id: 'Количество покупок',
    accessorKey: 'count_buys',
    header: 'Количество покупок',
    cell: ({ row }) => <ReText>{row.original.count_buys || '---'}</ReText>,
  },
];
