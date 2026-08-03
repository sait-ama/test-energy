'use client';

import React from 'react';

import type { ColumnDef } from '@tanstack/react-table';

import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { ReText } from '@re/ui-kit/ui/text';

import type { ChapterSchema } from '~shared/api/models/chapter';

export const getBundlesTable = () => {
  const columns: ColumnDef<ChapterSchema>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex h-12 items-center gap-3 self-center pl-1">
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
          <ReText weight="bold">Все</ReText>
          {table.getSelectedRowModel().rows.length ? (
            <ReText color="muted-foreground" size="sm">
              Выбрано {table.getSelectedRowModel().rows.length}
            </ReText>
          ) : null}
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex h-full items-center gap-3 pl-1">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
            }}
            aria-label="Select row"
          />
          <ReText noWrap size="sm">
            Том {row.original.tome} Глава {row.original.chapter}
          </ReText>
        </div>
      ),
      accessorKey: 'tome',
      enableSorting: false,
      enableHiding: false,
      size: 200,
    },
  ];

  return columns;
};
