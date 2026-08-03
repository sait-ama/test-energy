import { RefObject } from 'react';
import { ReadyState } from 'react-use-websocket';

import { createContext } from '@re/core/utils/create-context';

import { UserSchemaFragment } from '~shared/api/models/common';

import { WebSocketRequestSchema } from '../model/toolkit/types';

export type ChatContextValue = {
  client: {
    sendMessage: (message: WebSocketRequestSchema) => void;
    readyStateRef: RefObject<ReadyState>;
    startTyping: (channelId: number) => void;
    stopTyping: (channelId: number) => void;
    markRead: (channelId: number) => void;
  };
  user: UserSchemaFragment;
  activeChannelId: number | null;
  setActiveChannelId: (newChannelId?: number | null) => void;
};

export const {
  useStore: useChatContext,
  Provider: ChatProvider,
  Context: ChatContext,
} = createContext<ChatContextValue, ChatContextValue>((v) => v, 'ChatContext');
