import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';

import { createContextSelector } from '@re/core/utils/create-context-selector';

import { removeFriend, removeFriendFromFriendShipLocally } from '~entities/friend/model/mutations';
import { getQueryClient } from '~shared/api/react-query';
import { useSession } from '~shared/lib/session/use-session';
import { noop } from '~shared/utils/noop';

export interface FriendActionType {
  text: ReactNode;
  icon?: ReactNode;
  action: (id: NumberIsomorphic, friendId: NumberIsomorphic, sessionId: number | undefined) => void;
}
export interface FriendActionsStoreType {
  actions: FriendActionType[];
  makeAction: (action: FriendActionType, friendId: NumberIsomorphic) => void;
}

export const actions = [
  {
    text: 'Удалить из друзей',
    action: async (whoId, friendId, sessionId) => {
      await getQueryClient()
        //@ts-ignore
        .fetchQuery(removeFriend({ userId: sessionId, friendId: Number(friendId) }))
        .then((v) => {
          if (sessionId && whoId == sessionId)
            removeFriendFromFriendShipLocally(sessionId, friendId);
          return v;
        });
    },
  },
] satisfies FriendActionType[];

export const { useStore: useFriendShipActionStore, Provider: FriendShipActionsProvider } =
  createContextSelector<
    FriendActionsStoreType,
    { actions: FriendActionsStoreType['actions']; friendId: number }
  >(({ actions = [], friendId }) => {
    const sessionId = useSession((v) => v?.id);
    const params = useParams();
    const makeAction = useCallback(
      (action: FriendActionType, friendId: NumberIsomorphic) => {
        action.action(params.id, friendId, sessionId);
      },
      [sessionId, params, friendId]
    );

    return useMemo(() => {
      if (friendId != sessionId && Number(params.id) != sessionId)
        return {
          actions: [],
          makeAction: noop,
        } as FriendActionsStoreType;
      return { actions, makeAction };
    }, [actions, params.id, sessionId]);
  }, 'FriendshipActionStore');
