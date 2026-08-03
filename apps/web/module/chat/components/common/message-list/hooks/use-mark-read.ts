import { useCallback, useEffect } from 'react';

import { useChannelActionContext, useChannelStateContext } from 'module/chat/context';
import { ChannelSchema } from 'module/chat/model/types';

import { useRoomMessageEvents } from '../../chat/hooks/use-chat-events';

const hasReadLastMessage = (channel: ChannelSchema) => {
  // Оставляем всегда false, так как у нас в текущей реализации событие приходит в моменте
  // и channel.is_unread может быть некорректным
  return false;
};

type UseMarkReadParams = {
  isMessageListScrolledToBottom: boolean;
  wasMarkedUnread?: boolean;
  userId: number;
};

/**
 * Takes care of marking a channel read. The channel is read only if all the following applies:
 * 1. the message list is scrolled to the bottom
 * 2. the channel was not marked unread by the user
 * @param isMessageListScrolledToBottom
 * @param wasChannelMarkedUnread
 */
export const useMarkRead = ({
  isMessageListScrolledToBottom,
  wasMarkedUnread,
  userId,
}: UseMarkReadParams) => {
  const { markRead } = useChannelActionContext('useMarkRead');
  const { channel } = useChannelStateContext('useMarkRead');

  const shouldMarkRead = useCallback(
    () =>
      !document.hidden &&
      !wasMarkedUnread &&
      isMessageListScrolledToBottom &&
      !hasReadLastMessage(channel),
    [channel, isMessageListScrolledToBottom, wasMarkedUnread]
  );

  useRoomMessageEvents(channel.id, (_message) => {
    // if (message.user_id === userId) return;

    if (!isMessageListScrolledToBottom || wasMarkedUnread || document.hidden) {
      // TODO: implement passive ui update for unread state
    } else if (shouldMarkRead()) {
      markRead();
    }
  });

  useEffect(() => {
    const onVisibilityChange = () => {
      if (shouldMarkRead()) markRead();
    };

    if (shouldMarkRead()) {
      markRead();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [shouldMarkRead, markRead]);
};
