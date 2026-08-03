import { lazy, Suspense } from 'react';

import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';

import { useChargeModal } from '~shared/lib/charge/use-charge-modal';

const Charge = lazy(() =>
  import(/* webpackChunkName: "Charge" */ '~features/charge/charge').then((m) => ({
    default: m.Charge,
  }))
);

export const ChargeModalAsyncConditional = () => {
  const { isOpen, close } = useChargeModal();

  if (!isOpen) return null;

  return (
    <Suspense fallback={<DialogLoading onCancel={close} />}>
      <Charge />
    </Suspense>
  );
};
