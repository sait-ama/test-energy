'use client';

import React, { type Dispatch, Fragment, type SetStateAction, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import { cn } from '@re/ui-kit/utils/cn';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~shared/ui/table';
import { noop } from '~shared/utils/noop';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setSelectedRows?: Dispatch<SetStateAction<number[]>>;
  isLoading?: boolean;
  onTrigger: () => void;
  canTrigger?: boolean;
  isEmpty?: boolean;
}

export function VirtualizedDataTable<TData, TValue>({
  columns,
  data,
  setSelectedRows = noop,
  isLoading,
  onTrigger,
  canTrigger,
  isEmpty,
  className,
  height = '80vh',
}: DataTableProps<TData, TValue> & { height?: string; className?: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
    },
  });

  const { rows } = table.getRowModel();

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedRowsData = Object.keys(rowSelection)
      .map((selectedRow) => selectedRow)
      .map((rowId) => table.getRow(rowId))
      .map((it) => it.original.id);
    setSelectedRows(selectedRowsData);
  }, [rowSelection]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 50,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== 'undefined' && !navigator.userAgent.includes('Firefox')
        ? (element) => element.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <div
      ref={tableContainerRef}
      style={{
        overflow: 'auto', // Enables scrolling
        height, // Fixed height for the scrollable area
      }}
      className={cn('border-border rounded-md border', className)}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    // display: 'flex',
                    width: header.getSize(),
                  }}
                >
                  <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody
          style={{
            // display: 'grid',
            height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
            position: 'relative', //needed for absolute positioning of rows
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<unknown>;
            return (
              <Fragment key={row.id}>
                <TableRow
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => {
                    rowVirtualizer.measureElement(node);
                  }} //measure dynamic row height
                  key={row.id}
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                    width: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        // display: 'flex',
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              </Fragment>
            );
          })}
          <div
            style={{
              position: 'absolute',
              transform: `translateY(${rowVirtualizer.getTotalSize()}px)`,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <VirtualizedEdge
              onTrigger={onTrigger}
              canTrigger={!isLoading && canTrigger}
              isEmpty={isEmpty}
              position="bottom"
            />
          </div>
        </TableBody>
      </Table>
    </div>
  );
}

export const VirtualizedEdge = (props) => {
  const { onTrigger, position = 'bottom', canTrigger = false, isEmpty = false } = props;

  const [inView, setInView] = useState(false);
  const [inViewRef] = useInView({ threshold: 0.75, onChange: setInView });

  useEffect(() => {
    if (inView && canTrigger) {
      onTrigger?.().then(() => {
        setInView(false);
      });
    }
  }, [inView, canTrigger]);

  if (isEmpty) return null;

  return (
    <div
      className={cn('absolute z-[-1] h-3 w-10', position === 'top' ? 'top-0' : 'bottom-0')}
      ref={inViewRef}
    />
  );
};
