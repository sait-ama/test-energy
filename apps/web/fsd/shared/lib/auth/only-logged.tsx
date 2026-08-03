'use client';
import type { ReactNode } from 'react';

import { useLogged } from '~shared/lib/session/use-logged';

interface OnlyLoggedProps {
  children: ReactNode;
}

export const OnlyLogged = (props: OnlyLoggedProps) => {
  const logged = useLogged();
  if (!logged) return null;

  return props.children;
};
