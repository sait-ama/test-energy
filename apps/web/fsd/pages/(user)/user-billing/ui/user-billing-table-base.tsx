'use client';
import React, { ComponentProps, memo, PropsWithChildren, ReactNode } from 'react';

import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { InfiniteData, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';

import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { VirtualizedDataTable } from '~shared/ui/virtualized-data-table';

export const UserTransactionsHistoryRoot = ({ children }: PropsWithChildren) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};

export const UserTransactionsTableHeader = memo(
  ({
    className,
    actions,
    title,
    footer,
    ...props
  }: ComponentProps<'div'> & { actions?: ReactNode } & { title?: ReactNode } & {
    footer?: ReactNode;
  }) => {
    return (
      <div className={cn('flex w-full flex-wrap justify-between gap-4', className)} {...props}>
        <ReText size="xl" weight="semibold">
          {title}
        </ReText>
        <span className="flex flex-wrap items-center gap-2">{actions}</span>
        {footer}
      </div>
    );
  }
);

interface UserTransactionsHistoryListTableProps<
  TItemResponseSchema,
  TQueryKey extends unknown[] = unknown[],
  TQueryFnData = unknown,
  TError = unknown,
  TData = InfiniteData<TQueryFnData>,
  TPageParam = unknown,
> {
  columns: ColumnDef<TItemResponseSchema>[];
  extractItems: (props: TData) => TItemResponseSchema[];
  queryOptions: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>;
}

const UserTransactionsHistoryListTableContent = <
  TItemResponseSchema,
  TQueryKey extends unknown[] = unknown[],
  TQueryFnData = unknown,
  TError = unknown,
  TData = InfiniteData<TQueryFnData>,
  TPageParam = unknown,
>(
  props: UserTransactionsHistoryListTableProps<
    TItemResponseSchema,
    TQueryKey,
    TQueryFnData,
    TError,
    TData,
    TPageParam
  >
) => {
  const { columns, queryOptions, extractItems } = props;
  const { data, fetchNextPage, isFetchingNextPage, isFetching, hasNextPage } =
    useApiGenSuspenseInfiniteQuery(queryOptions);
  const items = extractItems(data);
  const height = (2 + items.length) * 50.67;

  return (
    <VirtualizedDataTable
      className="h-full"
      isLoading={isFetching}
      columns={columns}
      height={`${height}px`}
      data={items}
      isEmpty={!isFetching && !items.length}
      onTrigger={fetchNextPage}
      canTrigger={hasNextPage && !isFetching && !isFetchingNextPage}
    />
  );
};

interface UserTransactionHistoryTableProps<
  TItemResponseSchema,
  TQueryKey extends unknown[] = unknown[],
  TQueryFnData = unknown,
  TError = unknown,
  TData = InfiniteData<TQueryFnData>,
  TPageParam = unknown,
> extends ComponentProps<
    typeof UserTransactionsHistoryListTableContent<
      TItemResponseSchema,
      TQueryKey,
      TQueryFnData,
      TError,
      TData,
      TPageParam
    >
  > {
  fallback?: ReactNode;
}

export const UserTransactionHistoryTable = <
  TItemResponseSchema,
  TQueryKey extends unknown[] = unknown[],
  TQueryFnData = unknown,
  TError = unknown,
  TData = InfiniteData<TQueryFnData>,
  TPageParam = unknown,
>({
  fallback,
  ...props
}: UserTransactionHistoryTableProps<
  TItemResponseSchema,
  TQueryKey,
  TQueryFnData,
  TError,
  TData,
  TPageParam
>) => {
  return (
    <QuerySuspenseContainer fallback={fallback}>
      <UserTransactionsHistoryListTableContent {...props} />
    </QuerySuspenseContainer>
  );
};
