import React from 'react';
import dynamic from 'next/dynamic';

import { UserPromocodeHistoryListLoading } from '~pages/(user)/promocode/ui/table-skeleton';
import { UserBillingTab } from '~pages/(user)/user-billing/model/const';
import { useUserBillingTab } from '~pages/(user)/user-billing/model/hooks';
import { UserPaymentsHistoryListLoading } from '~pages/(user)/user-payments/ui/table-skeleton';
import { ErrorDisplay } from '~shared/lib/react-query/query-suspense-container';

const PaymentsBillingTable = dynamic(
  () =>
    import('../../user-payments/ui/table').then((v) => ({
      default: v.PaymentsBillingTable,
    })),
  { loading: () => <UserPaymentsHistoryListLoading /> }
);
const TicketsUserHistoryListTable = dynamic(
  () =>
    import('../../promocode/ui/user-promo-codes-list').then((v) => ({
      default: v.TicketsUserHistoryListTable,
    })),
  { loading: () => <UserPromocodeHistoryListLoading /> }
);
export const UserBillingTable = () => {
  const [tab] = useUserBillingTab();
  switch (tab) {
    case UserBillingTab.TICKETS: {
      return <TicketsUserHistoryListTable />;
    }
    case UserBillingTab.MONEY: {
      return <PaymentsBillingTable />;
    }
    default: {
      return (
        <ErrorDisplay
          showOverlay
          fallbackContent={<UserPromocodeHistoryListLoading />}
          text="Скоро появится"
        />
      );
    }
  }
};
