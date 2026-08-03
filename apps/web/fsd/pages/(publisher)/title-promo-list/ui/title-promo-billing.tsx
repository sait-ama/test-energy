import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { Spinner } from '@re/ui-kit/ui/spinner';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { DataTable } from '~shared/ui/data-table';
import { InViewTrigger } from '~shared/ui/in-view-trigger';

import { useCurrentPagePromoBillingQuery } from '../model/hooks';
import { TitlePromoBillingTableItemSchema } from '../model/types';

const TableTrigger = () => {
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useCurrentPagePromoBillingQuery();

  return (
    <InViewTrigger
      className="flex min-h-2 w-full items-center justify-between"
      onTrigger={fetchNextPage}
      canTrigger={hasNextPage && !isFetchingNextPage}
    >
      <Spinner show className="mx-auto my-2" />
    </InViewTrigger>
  );
};

export const TitlePromoBillingTable = memo(() => {
  const t = useTranslations(
    'publisher.segments.profile-layout.advertisement.sections.billing-table'
  );
  const { data: promoBillingData } = useCurrentPagePromoBillingQuery();

  const data = useMemo(
    () =>
      promoBillingData.pages
        .flatMap((it) => it.results)
        .map((it) => ({
          ...it,
          name: it.title ? it.title.main_name : null,
        })),
    [promoBillingData]
  );

  const columns = useMemo<ColumnDef<TitlePromoBillingTableItemSchema>[]>(
    () => [
      {
        id: 'id',
        accessorKey: 'id',
        header: t('keys.id'),
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: t('keys.name'),
      },
      {
        id: 'sum',
        accessorKey: 'sum',
        header: t('keys.sum'),
      },
      {
        id: 'action_type',
        accessorKey: 'action_type',
        header: t('keys.action_type'),
        cell: ({ row }) => {
          const { action_type } = row.original;

          //@ts-ignore
          return <span>{t(`labels.action_type.${action_type}`)}</span>;
        },
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: t('keys.created_at'),
        cell: ({ row }) => {
          const { created_at } = row.original;

          return <span>{dayjs(created_at).format('DD.MM.YYYY')}</span>;
        },
      },
    ],
    []
  );

  return (
    <div className="bg-secondary container mx-auto mt-2 rounded-md">
      <DataTable columns={columns} data={data} />
      <TableTrigger />
    </div>
  );
});

export const TitlePromoBilling = () => (
  <QuerySuspenseContainer
    fallback={<div className="bg-secondary h-100 w-full animate-pulse rounded-md" />}
  >
    <TitlePromoBillingTable />
  </QuerySuspenseContainer>
);
