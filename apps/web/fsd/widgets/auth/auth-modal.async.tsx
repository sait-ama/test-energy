import { lazy, Suspense } from 'react';

import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';

import { useAuthModal } from '~shared/lib/auth/use-auth-modal';

const AuthModal = lazy(() =>
  import(/* webpackChunkName: "Auth" */ '~widgets/auth/auth-modal').then((m) => ({
    default: m.AuthModal,
  }))
);

export const AuthModalAsyncConditional = () => {
  const { isOpen, close } = useAuthModal();

  if (!isOpen) return null;

  return (
    <Suspense fallback={<DialogLoading onCancel={close} />}>
      <AuthModal />
    </Suspense>
  );
};
