import { HalloweenItem } from '@re/ui-kit/icons/hellowen-item';

import { EventDateType, getEvent } from '~shared/lib/event-management/get-event';

export const getEventIcon = () => {
  const event = getEvent();

  switch (event) {
    case EventDateType.HALLOWEEN:
      return <HalloweenItem className="size-5" size={20} />;
    default: {
      return <HalloweenItem className="size-5" size={20} />;
    }
  }
};
