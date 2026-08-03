'use client';
import { lazy, Suspense } from 'react';

import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';

import { useOnReroute } from '~shared/hooks/use-on-reroute';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';

const InfoModal = lazy(() =>
  import(/* webpackChunkName: "InfoModal" */ './info-modal').then((m) => ({ default: m.InfoModal }))
);

export const InfoModalAsyncConditional = () => {
  const { isOpen, close } = useInfoModal();

  useOnReroute(() => close());

  if (!isOpen) return null;

  return (
    <Suspense fallback={<DialogLoading onCancel={close} />}>
      <InfoModal />
    </Suspense>
  );
};
