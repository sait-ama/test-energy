'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useRouter } from '@bprogress/next';

import { AuthTypes } from '~shared/api/models/auth';
import { Routing } from '~shared/config/routing';

import { useLogged } from '../session/use-logged';

export interface UnloggedBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onLoggedChange?: (logged: boolean) => void;
}

export const UnloggedBoundary = ({
  children,
  fallback = null,
  onLoggedChange,
}: UnloggedBoundaryProps) => {
  const logged = useLogged();
  const router = useRouter();

  useEffect(() => {
    const onLoggedChangeDefault = (value: boolean) => {
      //@ts-ignore
      if (!value) router.push(Routing.Home.main({ form: AuthTypes.LOGIN }));
    };
    const action = onLoggedChange ?? onLoggedChangeDefault;

    action(logged);
  }, [logged]);

  return logged ? children : fallback;
};
