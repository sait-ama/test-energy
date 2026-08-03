import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { userPaymentListInfiniteOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  UserTransactionHistoryTable,
  UserTransactionsHistoryRoot,
  UserTransactionsTableHeader,
} from '~pages/(user)/user-billing/ui/user-billing-table-base';
import { getColumns, Mappers } from '~pages/(user)/user-payments/model/columns';
import {
  PaymentsCoinsListQueryProvider,
  usePaymentsCoinsListQueryStore,
} from '~pages/(user)/user-payments/model/store';
import { CoinsOrderingSelector } from '~pages/(user)/user-payments/ui/ordering';
import { StatusSelector } from '~pages/(user)/user-payments/ui/status-selector';
import { UserPaymentsHistoryListLoading } from '~pages/(user)/user-payments/ui/table-skeleton';
import { TypeSelector } from '~pages/(user)/user-payments/ui/type-selector';
import { FormsTypes } from '~shared/api/models/forms';
import { createQueryInfiniteGeneratedWithClient } from '~shared/api/queries-code-gen-with-client';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

const getQueryOptions = createQueryInfiniteGeneratedWithClient(userPaymentListInfiniteOptions, {
  placeholderData: keepPreviousData,
});
const UserTransactionHistoryTableContent = () => {
  const t = useTranslations('user-coins-history');

  const query = usePaymentsCoinsListQueryStore((v) => v.query);
  const { data: { content: { type: types = [] } = {} } = {} } = useQuery({
    ...getTypesBaseKey({
      type: FormsTypes.MONEY_PAYMENTS,
      get: ['type', 'status'],
    }),
  });

  const typesRec = useMemo(
    () =>
      types.reduce(
        (acc, cur) => {
          const id = String(cur.id);
          acc[id] = cur.name;
          return acc;
        },
        {} as Record<string, string>
      ),
    [types.length]
  );
  const mappers = useMemo(
    () =>
      ({
        type: typesRec,
      }) as Mappers,
    [typesRec]
  );
  const columns = useMemo(() => getColumns(t, mappers), [mappers]);
  const queryOptions = useMemo(() => getQueryOptions({ api: { query }, suspense: true }), [query]);
  return (
    <UserTransactionHistoryTable
      extractItems={(v) => v.pages.flatMap((v) => v.results)}
      columns={columns}
      fallback={<UserPaymentsHistoryListLoading />}
      queryOptions={queryOptions}
    />
  );
};

export const PaymentsBillingTable = () => {
  const t = useTranslations('user-coins-history');

  return (
    <UserTransactionsHistoryRoot>
      <PaymentsCoinsListQueryProvider>
        <>
          <UserTransactionsTableHeader
            title={t('title')}
            key="header"
            actions={
              <>
                <CoinsOrderingSelector key="ordering" />
                <TypeSelector key="type" />
                <StatusSelector key="status" />
              </>
            }
          />
          <UserTransactionHistoryTableContent />
        </>
      </PaymentsCoinsListQueryProvider>
    </UserTransactionsHistoryRoot>
  );
};
