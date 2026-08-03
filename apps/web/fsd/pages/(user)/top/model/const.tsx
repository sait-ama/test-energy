import React, { Suspense } from 'react';

import {
  v2UsersEventTopRetrieveInfiniteOptions,
  v2UsersTopRetrieveInfiniteOptions,
} from '@re/api/generated/@tanstack/react-query.gen';

import { CurrentUserPositionIndicator } from '~pages/(user)/top/current-user-position-indicator';
import { EventBackgrounds } from '~pages/(user)/top/event/backgrounds';
import { client } from '~shared/api/client';
import { UserTopOrdering } from '~shared/api/models/user';
import { EventDateType, getEvent } from '~shared/lib/event-management/get-event';

import { getEventIcon } from '../event/icon';

const topOrderings: UserTopOrdering[] = [
  UserTopOrdering.VIEWS,
  UserTopOrdering.VOTES,
  UserTopOrdering.COMMENTS,
  UserTopOrdering.POSTS,
  UserTopOrdering.FRIENDS,
  UserTopOrdering.SUBSCRIBERS,
];

export const displayEvent = (event: EventDateType) => {
  return event === EventDateType.HALLOWEEN;
};

export const getTopOrderings = () => {
  const event = getEvent();
  const showEvent = displayEvent(event);
  return {
    defaultOrderings: topOrderings,
    event: event !== EventDateType.DEFAULT && showEvent ? event : null,
  };
};

const createDefaultConfiguration = (ordering: UserTopOrdering) => ({
  orderingField: `count_${ordering}`,
  queryOptions: v2UsersTopRetrieveInfiniteOptions({ client, query: { ordering } }),
});

const createEventConfiguration = () => ({
  orderingField: 'event_points',
  icon: getEventIcon(),
  queryOptions: v2UsersEventTopRetrieveInfiniteOptions({ client }),
  slot: (
    <>
      <EventBackgrounds />
      <Suspense fallback={null}>
        <CurrentUserPositionIndicator />
      </Suspense>
    </>
  ),
});

export const getConfiguration = (ordering: UserTopOrdering) => {
  if (ordering === UserTopOrdering.EVENT_POINTS) return createEventConfiguration();
  return createDefaultConfiguration(ordering);
};
