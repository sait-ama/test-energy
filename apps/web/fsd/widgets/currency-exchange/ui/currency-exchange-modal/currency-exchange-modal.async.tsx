import { lazy, Suspense } from 'react';

import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';

import { useExchangeModal } from '~shared/lib/exchange/use-exchnage-modal';

const StoreCurrencyExchangeModalComponent = lazy(() =>
  import(
    /* webpackChunkName: "StoreCurrencyExchangeModalComponent" */ '~widgets/currency-exchange/ui/currency-exchange-modal/store-currency-exchange-modal'
  ).then((m) => ({
    default: m.StoreCurrencyExchangeModal,
  }))
);

export const StoreCurrencyExchangeModal = () => {
  const { isOpen } = useExchangeModal();

  if (!isOpen) return null;

  return (
    <Suspense fallback={<DialogLoading />}>
      <StoreCurrencyExchangeModalComponent />
    </Suspense>
  );
};
