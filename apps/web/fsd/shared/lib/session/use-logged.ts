'use client';

import { useCallback } from 'react';

import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { useSession } from '~shared/lib/session/use-session';

export const useLogged = () => useSession((v) => !!v?.id);
export const useLoggedCheck = () => {
  const logged = useLogged();
  const { open } = useAuthModal();

  const validate = useCallback(() => {
    if (!logged) open();

    return logged;
  }, [logged, open]);

  return useCallback(
    <F extends (...args: Parameters<F>) => ReturnType<F>>(callback: F) =>
      (...args: Parameters<F>) => {
        if (validate()) {
          callback(...args);
        }
      },
    [validate]
  );
};
