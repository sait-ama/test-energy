import { ChannelMemberSchema, MessageUserSchema } from 'module/chat/model/types';

import type { ReactEventHandler } from '../types';

export type UserEventHandler = (event: React.BaseSyntheticEvent, user: ChannelMemberSchema) => void;

export const useUserHandler = (
  user?: MessageUserSchema,
  eventHandlers?: {
    onUserClickHandler?: UserEventHandler;
    onUserHoverHandler?: UserEventHandler;
  }
): {
  onUserClick: ReactEventHandler;
  onUserHover: ReactEventHandler;
} => ({
  onUserClick: (event) => {
    if (typeof eventHandlers?.onUserClickHandler !== 'function' || !user) {
      return;
    }
    eventHandlers.onUserClickHandler(event, user);
  },
  onUserHover: (event) => {
    if (typeof eventHandlers?.onUserHoverHandler !== 'function' || !user) {
      return;
    }

    eventHandlers.onUserHoverHandler(event, user);
  },
});
