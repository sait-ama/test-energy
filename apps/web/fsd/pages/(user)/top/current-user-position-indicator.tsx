'use client';

import { useEffect } from 'react';

import { v2UsersEventTopPlaceRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { ReText } from '@re/ui-kit/ui/text';
import { useSuspenseQuery } from '@tanstack/react-query';

import { client } from '~shared/api/client';
import { useBottomActions } from '~shared/lib/bottom-bar/use-bottom-actions';
import { useSession } from '~shared/lib/session/use-session';

import { getEventIcon } from './event/icon';

const TOAST_NAME = 'user-position-indicator';

export const CurrentUserPositionIndicator = () => {
  const session = useSession();

  const { data } = useSuspenseQuery(v2UsersEventTopPlaceRetrieveOptions({ client }));
  const { register, unregister } = useBottomActions();

  useEffect(() => {
    if (!session) return;

    register({
      key: TOAST_NAME,
      index: -1,
      node: (
        <div className="flex w-full justify-center">
          <div className="bg-background flex justify-center rounded-md px-6 py-3">
            <ReText color="muted-foreground">Ваша позиция:&nbsp;</ReText>
            <span>{data?.place}</span>
            <div className="w-8" />
            <span className="flex">
              {getEventIcon()}&nbsp;{session.event_points}
            </span>
          </div>
        </div>
      ),
    });
    return () => unregister(TOAST_NAME);
  }, [session]);

  return null;
};
