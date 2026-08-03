import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { useSession } from '~shared/lib/session/use-session';

import { ChatProvider } from '../../../context/chat-context';
import { ChatEventProvider } from '../../../context/chat-event-context';
import { useCreateChatEvents } from './hooks/use-chat-events';
import { useChatWebSocket } from './hooks/use-chat-websocket';

export type ChatProps = {
  initialId?: number;
  chatId?: number;
};

export const Chat = (props: PropsWithChildren<ChatProps>) => {
  const { children, initialId, chatId } = props;
  const rawUser = useSession()!;

  const eventService = useCreateChatEvents();

  const wsClient = useChatWebSocket({
    onProcessMessage: (data) => {
      eventService.processEvent(data);
    },
    onConnectionStatusChange: (status, error) => {
      eventService.emitConnectionStatusChange(status, error);
    },
  });

  const user = useMemo(() => {
    return {
      id: rawUser.id,
      username: rawUser.username,
      avatar: rawUser.avatar,
      frame: rawUser.frame,
      is_premium: rawUser.is_premium,
    };
  }, [rawUser.id]);

  const [activeChannelId, setActiveChannelId] = useState<number | null>(
    chatId ?? initialId ?? null
  );

  useEffect(() => {
    setActiveChannelId(chatId ?? initialId ?? null);
  }, [chatId]);

  const handleSetActiveChannel = useCallback((newChannelId?: number | null) => {
    setActiveChannelId(newChannelId ?? null);
  }, []);

  const chatContextValue = useMemo(
    () => ({
      client: wsClient,
      user,
      activeChannelId,
      setActiveChannelId: handleSetActiveChannel,
    }),
    [activeChannelId, user, handleSetActiveChannel, wsClient]
  );

  return (
    <ChatEventProvider value={eventService}>
      <ChatProvider value={chatContextValue}>{children}</ChatProvider>
    </ChatEventProvider>
  );
};
