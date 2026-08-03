import { useCallback } from 'react';

import throttle from 'lodash.throttle';

import { UserSchemaFragment } from '~shared/api/models/common';

import { useChatContext } from '../../../../context';
import { useChannelStateContext } from '../../../../context/channel-state-context';
import { UserSuggestionItem } from '../../user-item';
import type { UserTriggerSetting } from '../trigger-provider';
import { SearchLocalUserParams, searchLocalUsers } from './utils';

export type UserTriggerParams = {
  onSelectUser: (item: UserSchemaFragment) => void;
  disableMentions?: boolean;
};

export const useUserTrigger = (params: UserTriggerParams): UserTriggerSetting => {
  const { disableMentions, onSelectUser } = params;

  const { user } = useChatContext('useUserTrigger');
  const { channel } = useChannelStateContext('useUserTrigger');

  const { members } = channel;

  const getMembers = useCallback(() => {
    return members ? members : [];
  }, [members]);

  const queryMembersThrottled = useCallback(
    throttle(async (query: string, onReady: (users: UserSchemaFragment[]) => void) => {
      try {
        const users = members?.filter((user) =>
          user.username?.includes(query)
        ) as UserSchemaFragment[];

        if (onReady && users.length) {
          onReady(users);
        } else {
          onReady([]);
        }
      } catch (error) {
        console.log({ error });
      }
    }, 200),
    [channel]
  );

  return {
    callback: (item) => onSelectUser(item),
    component: UserSuggestionItem,
    dataProvider: (query, text, onReady) => {
      if (disableMentions) return;

      const users = getMembers();

      if (!query || users?.length < 100) {
        const params: SearchLocalUserParams = {
          ownUserId: user.id,
          query,
          text,
          users,
        };

        const matchingUsers = searchLocalUsers(params);

        const usersToShow = 7;
        const data = matchingUsers.slice(0, usersToShow);

        if (onReady) onReady(data, query);
        return data;
      }

      return queryMembersThrottled(query, (data: UserSchemaFragment[]) => {
        if (onReady) onReady(data, query);
      });
    },
    output: (entity) => ({
      caretPosition: 'next',
      key: entity.id,
      text: `@${entity.username || entity.id}`,
    }),
  };
};
