import { lazy, Suspense } from 'react';

import { displayEvent } from '~pages/(user)/top/model/const';
import { EventDateType, getEvent } from '~shared/lib/event-management/get-event';

const HalloweenBackgrounds = lazy(() =>
  import('~pages/(user)/top/event/halloween-backgrounds').then((v) => ({
    default: v.HalloweenBackgrounds,
  }))
);
export const EventBackgrounds = () => {
  const event = getEvent();
  const showEvent = displayEvent(event);

  if (!showEvent) return null;

  switch (event) {
    case EventDateType.HALLOWEEN:
      return (
        <Suspense>
          <HalloweenBackgrounds />
        </Suspense>
      );
    default:
      return null;
  }
};
