'use client';
import React, { FC, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { v2UsersTicketsRetrieveInfiniteOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { keepPreviousData } from '@tanstack/react-query';

import { getColumns } from '~pages/(user)/promocode/model/columns';
import { ActionTypeSelector } from '~pages/(user)/promocode/ui/action-type-selector';
import { OrderingSelector } from '~pages/(user)/promocode/ui/ordering-sort';
import { StatusSelector } from '~pages/(user)/promocode/ui/status-selector';
import {
  UserTransactionHistoryTable,
  UserTransactionsHistoryRoot,
  UserTransactionsTableHeader,
} from '~pages/(user)/user-billing/ui/user-billing-table-base';
import { UserPaymentsHistoryListLoading } from '~pages/(user)/user-payments/ui/table-skeleton';
import { createQueryInfiniteGeneratedWithClient } from '~shared/api/queries-code-gen-with-client';

import { useTicketsListQueryStore } from '../model/store';

const getQueryOptions = createQueryInfiniteGeneratedWithClient(
  v2UsersTicketsRetrieveInfiniteOptions,
  { placeholderData: keepPreviousData }
);

const TicketsHistoryTableList = () => {
  const t = useTranslations('promo-codes');

  const columns = useMemo(() => getColumns(t), []);
  const { query } = useTicketsListQueryStore();
  const queryOptions = useMemo(
    () => getQueryOptions({ api: { query }, suspense: true }),
    [query?.ordering, query?.action_type, query?.page, query?.count, query?.status]
  );
  return (
    <UserTransactionHistoryTable
      extractItems={(v) => v.pages.flatMap((v) => v.results)}
      columns={columns}
      fallback={<UserPaymentsHistoryListLoading />}
      queryOptions={queryOptions}
    />
  );
};
export const TicketsUserHistoryListTable: FC = () => {
  const t = useTranslations('promo-codes');

  return (
    <UserTransactionsHistoryRoot>
      <UserTransactionsTableHeader
        title={t('title')}
        actions={
          <>
            <OrderingSelector />
            <StatusSelector />
            <ActionTypeSelector />
          </>
        }
      />
      <TicketsHistoryTableList />
    </UserTransactionsHistoryRoot>
  );
};
