'use client';
import type { ReactNode } from 'react';

import { useSession } from '~shared/lib/session/use-session';

interface StaffOnlyProps {
  children: ReactNode;
}

export const StaffOnly = (props: StaffOnlyProps) => {
  const session = useSession();
  if (!session || !session.is_staff) return null;

  return props.children;
};
