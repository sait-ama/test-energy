'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { createContext } from '@re/core/utils/create-context';

import { AuthTypes } from '~shared/api/models/auth';

export interface State {
  authType: AuthTypes;
  isOpen: boolean;
  onSuccess: null | undefined | VoidFunction;
}

export interface Actions {
  open: (options?: { authType?: AuthTypes; onSuccess?: () => void }) => void;
  close: () => void;
}

export const { Provider: AuthModalProvider, useStore: useAuthModal } = createContext<
  State & Actions,
  never
>(() => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const formParam = searchParams.get('form');

  const authType =
    formParam && Object.values<string>(AuthTypes).includes(formParam)
      ? (formParam as AuthTypes)
      : AuthTypes.LOGIN;

  const [state, setState] = useState<State>({
    isOpen: false,
    authType,
    onSuccess: null,
  });

  useEffect(() => {
    if (!formParam) return;

    setState((prev) => ({ ...prev, isOpen: true, authType }));
  }, [pathname]);

  return {
    ...state,
    open: (options) => {
      setState((prev) => ({
        ...prev,
        ...options,
        // authType: options?.authType || prev.authType,
        isOpen: true,
      }));
    },
    close: () => {
      setState((prev) => ({ ...prev, isOpen: false }));
    },
  };
}, 'AuthModalStore');
