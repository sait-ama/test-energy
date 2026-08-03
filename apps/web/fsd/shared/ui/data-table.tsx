'use client';

import { PropsWithChildren, ReactNode, useState } from 'react';

import Settings from '@re/ui-kit/icons/settings';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { cn } from '@re/ui-kit/utils/cn';
import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingState,
  TableOptions,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Input } from '~shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~shared/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  showColumnsMenu?: boolean;
  withoutHeader?: boolean;
  className?: string;
  config?: Partial<TableOptions<TData>> | null;
}

const usernameFilter: FilterFn<{ username: string }> = (row, columnId, value, addMeta) => {
  // Rank the item
  const username = row.getValue<{ username: string }>(columnId)?.username;

  // Store the itemRank info
  addMeta({
    username,
  });

  // Return if the item should be filtered in/out
  return username.includes(value);
};

// todo: сделать более гибкую абстракцию?
export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = '',
  className,
  searchPlaceholder = 'Поиск...',
  showColumnsMenu = false,
  withoutHeader,
  config = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      username: usernameFilter, //define as a filter function that can be used in column definitions
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
    },
    ...config,
  });

  const Header = withoutHeader ? () => null : DefaultHeader;

  return (
    <div className={cn('border-border overflow-hidden rounded-md border', className)}>
      {searchKey || showColumnsMenu ? (
        <Header>
          {searchKey && (
            <div className="ml-4 flex items-center py-2">
              <Input
                placeholder={searchPlaceholder}
                onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            </div>
          )}

          {showColumnsMenu ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" circle className="mr-4 ml-auto">
                  <Settings />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => {
                        column.toggleVisibility(!!value);
                      }}
                    >
                      {/*todo i18n moment*/}
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </Header>
      ) : null}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                // todo разобраться с типом flexRender как children, каким образом тут парсится Element
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : (flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      ) as ReactNode)}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  // todo разобраться с типом flexRender как children, каким образом тут парсится Element

                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext()) as ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Нет результатов :(
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const DefaultHeader = ({ children }: PropsWithChildren) => (
  <div className="border-b-border flex items-center border-b py-2">{children}</div>
);
