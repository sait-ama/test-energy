import { lazy, Suspense } from 'react';

const GiftModalComponent = lazy(() =>
  import(/* webpackChunkName: "GiftModal" */ './gift-modal.no-import').then((m) => ({
    default: m.GiftModal,
  }))
);

export const GiftModal = () => {
  return (
    <Suspense fallback={null}>
      <GiftModalComponent />
    </Suspense>
  );
};
