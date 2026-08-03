'use client';
import dynamic from 'next/dynamic';

import { EventDateType, getEvent } from '~shared/lib/event-management/get-event';

const HalloweenEventModalAsync = dynamic(
  () =>
    import('~features/halloween-event-modal/halloween-event-root').then(
      (v) => v.HalloweenEventModalAsync
    ),
  { ssr: false }
);

export const EventModal = () => {
  const event = getEvent();
  switch (event) {
    case EventDateType.HALLOWEEN:
      return <HalloweenEventModalAsync />;
    default:
      return null;
  }
};
