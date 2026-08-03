import { ReactNode, Suspense, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import ChevronDownIcon from '@re/ui-kit/icons/chevron-down';
import ChevronTopIcon from '@re/ui-kit/icons/chevron-top';
import { Button } from '@re/ui-kit/ui/button';
import { Spinner } from '@re/ui-kit/ui/spinner';
import { useIsFetching } from '@tanstack/react-query';
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';

import { v2DashboardPromoRetrieveQueryKey } from '~shared/api/generated/tanstack';
import {
  QuerySuspenseContainer,
  withQuerySuspenseContainer,
} from '~shared/lib/react-query/query-suspense-container';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~shared/ui/table';
import { cn } from '~shared/utils/cn';

import { useCurrentPagePublisherQuery } from '../model/hooks';
import { TitlePromoListTableStoreProvider, useTitlePromoListTableStore } from '../model/store';
import { TitlePromoListTableItemSchema } from '../model/types';

import { TitlePromoListActions } from './title-promo-list-actions';

interface StatusCellProps {
  isActive: boolean;
}
const StatusCell = ({ isActive }: StatusCellProps) => {
  const t = useTranslations(
    'publisher.segments.profile-layout.advertisement.sections.ad-table-detail'
  );
  return (
    <span className={cn(isActive ? 'text-success' : 'text-danger')}>
      {isActive ? t('active-status') : t('inactive-status')}
    </span>
  );
};
interface ChevronCellProps {
  childrenCount?: number;
  isExpanded: boolean;
  toggleExpanded: () => void;
  id: number;
}

const ChevronCell = ({ isExpanded, toggleExpanded, id, childrenCount }: ChevronCellProps) => {
  const { loadPromoList } = useTitlePromoListTableStore();
  const { data: publisher } = useCurrentPagePublisherQuery();

  const isFetching = useIsFetching({
    queryKey: v2DashboardPromoRetrieveQueryKey({
      path: {
        publisher_id: publisher.id,
      },
      query: {
        title_id: id,
        count: 50,
      },
    }),
  });

  const handleClick = async () => {
    await loadPromoList(id);
    setTimeout(() => toggleExpanded(), 200);
  };

  return (
    <Button size="sm" variant="ghost" onClick={handleClick}>
      {typeof childrenCount === 'number' ? <span className="mr-1">{childrenCount}</span> : null}
      {isFetching ? (
        <Spinner show />
      ) : isExpanded ? (
        <ChevronTopIcon className="w-4" />
      ) : (
        <ChevronDownIcon className="w-4" />
      )}
    </Button>
  );
};

interface HeaderCellProps {
  label: string;
}

const HeaderCell = ({ label }: HeaderCellProps) => {
  const t = useTranslations(
    'publisher.segments.profile-layout.advertisement.sections.ad-table.keys'
  );

  //@ts-ignore
  return t(label);
};

const columns: ColumnDef<TitlePromoListTableItemSchema>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <HeaderCell label={column.id} />,
    cell: ({ row }) => {
      const data = row.original;

      return (
        <Link
          style={{ paddingLeft: `${row.depth * 36}px` }}
          href={data.href ?? '%'}
          className={cn(
            data.href &&
              'line-clamp-2 inline-block w-50 cursor-pointer underline hover:no-underline'
          )}
        >
          {data.name}
        </Link>
      );
    },
  },
  {
    id: 'status',
    header: ({ column }) => <HeaderCell label={column.id} />,
    cell: ({ row }) => {
      const data = row.original;

      return <StatusCell isActive={data.isActive} />;
    },
  },
  {
    id: 'count_clicks',
    header: ({ column }) => <HeaderCell label={column.id} />,
    cell: ({ row }) => row.original.clicksOverall,
  },
  {
    id: 'count_views',
    header: ({ column }) => <HeaderCell label={column.id} />,
    cell: ({ row }) => row.original.viewsOverall,
  },
  {
    id: 'ctr',
    header: ({ column }) => <HeaderCell label={column.id} />,
    cell: ({ row }) => row.original.ctrOverall,
  },
  {
    id: 'dates',
    header: ({ column }) => <HeaderCell label={column.id} />,
    cell: ({ row }) => {
      const data = row.original;

      const dateStart = data.dateStart ? dayjs(data.dateStart).format('DD.MM.YYYY') : '';
      const dateEnd = data.dateEnd ? dayjs(data.dateEnd).format('DD.MM.YYYY') : '';

      return (
        <span>
          {dateStart}&nbsp;-
          <br />
          {dateEnd}
        </span>
      );
    },
  },
  {
    id: 'days_spent',
    header: ({ column }) => <HeaderCell label={column.id} />,
    cell: ({ row }) => {
      const data = row.original;

      return (
        <span>
          {data.daysSpent}/{data.totalDays}
        </span>
      );
    },
  },
  {
    id: 'chevron',
    header: '',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          {row.original.$$hasChildren ? (
            <ChevronCell
              id={row.original.id}
              isExpanded={row.getIsExpanded()}
              toggleExpanded={row.getToggleExpandedHandler()}
              childrenCount={row.original.childrenCount}
            />
          ) : null}
        </div>
      );
    },
  },
];

export interface TitlePromoListTableProps {
  className?: string;
}

// fuck memo
export const TitlePromoListTable = ({ className }: TitlePromoListTableProps) => {
  'use no memo';
  const tReusable = useTranslations('reusable');
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const { data } = useTitlePromoListTableStore();

  const table = useReactTable({
    data: data,
    columns: columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => (row.$$hasChildren ? (row.children ?? undefined) : undefined),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className={cn('bg-secondary overflow-hidden rounded-md', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext()) as ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {tReusable('empty_states.no-results')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export interface TitlePromoListProps {}

export const TitlePromoList = withQuerySuspenseContainer(() => (
  <QuerySuspenseContainer
    fallback={<div className="bg-secondary h-100 w-full animate-pulse rounded-md" />}
  >
    <div className="flex flex-col gap-4">
      <Suspense fallback={<div className="bg-secondary h-9 w-full animate-pulse rounded-md" />}>
        <TitlePromoListActions />
      </Suspense>
      <QuerySuspenseContainer
        fallback={<div className="bg-secondary h-100 w-full animate-pulse rounded-md" />}
      >
        <TitlePromoListTableStoreProvider>
          <TitlePromoListTable />
        </TitlePromoListTableStoreProvider>
      </QuerySuspenseContainer>
    </div>
  </QuerySuspenseContainer>
));
