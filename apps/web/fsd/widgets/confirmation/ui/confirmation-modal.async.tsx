import { lazy, Suspense } from 'react';

import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';

import { useConfirmationStore } from '~shared/lib/submit-action/use-submit-action';
// import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';
// import { useConfirmationStore } from '~shared/lib/submit-action/use-submit-action';

const ConfirmationModal = lazy(() =>
  import(
    /* webpackChunkName: "confirmation-modal" */ '~widgets/confirmation/ui/confirmation-modal'
  ).then((m) => ({ default: m.ConfirmationModal }))
);

export const ConfirmationModalAsync = () => (
  <Suspense>
    <ConfirmationModal />
  </Suspense>
);

export const ConfirmationModalAsyncConditional = () => {
  const params = useConfirmationStore((v) => v.params);

  if (!params) return null;

  return (
    <Suspense fallback={<DialogLoading />}>
      <ConfirmationModal />
    </Suspense>
  );
};
