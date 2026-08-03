'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

import { useCookie } from '~shared/hooks/use-cookie';

const HalloweenModal = dynamic(() =>
  import('~features/halloween-event-modal/ui/halloween-event-modal').then((m) => ({
    default: m.HalloweenEventModal,
  }))
);
export const HalloweenEventModalAsync = () => {
  const [value] = useCookie('halloweeen-modal');
  return <Suspense>{!value && <HalloweenModal />}</Suspense>;
};
