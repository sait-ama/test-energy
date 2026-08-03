import React from 'react';

import { createContext } from '@re/core/utils/create-context';

import { UserSchemaFragment } from '~shared/api/models/user';
import { Error } from '~shared/types/buisines';

import type { ChannelStateReducerAction } from '../components/common/channel/channel-state';
import type { Attachment, SendMessageOptions, UpdateMessageOptions } from '../types';
import type { ChatMessageMessage, MessageStatus } from './channel-state-context';
export type MarkReadWrapperOptions = {
  /**
   * Signal, whether the `channelUnreadUiState` should be updated.
   * By default, the local state update is prevented when the Channel component is mounted.
   * This is in order to keep the UI indicating the original unread state, when the user opens a channel.
   */
  updateChannelUiUnreadState?: boolean;
};

export type MessageAttachments = Array<Attachment>;

export type MessageToSend = {
  attachments?: Attachment[];
  files?: Attachment[];
  error?: Error;
  errorStatusCode?: number;
  local_uuid?: string;
  mentioned_users?: UserSchemaFragment[];
  parent?: ChatMessageMessage;
  parent_id?: string;
  status?: MessageStatus;
  text?: string;
};

export type RetrySendMessage = (message: ChatMessageMessage) => Promise<void>;

export type ChannelActionContextValue = {
  addNotification: (text: string, type: 'error' | 'info' | 'success' | 'warning') => void;
  deleteMessage: (uuid: string) => Promise<void>;
  dispatch: React.Dispatch<ChannelStateReducerAction>;
  editMessage: (message: ChatMessageMessage, options?: UpdateMessageOptions) => Promise<void>;
  jumpToFirstUnreadMessage: (
    queryMessageLimit?: number,
    highlightDuration?: number
  ) => Promise<void>;
  jumpToLatestMessage: () => Promise<void>;
  jumpToMessage: (messageUuid: string, limit?: number, highlightDuration?: number) => Promise<void>;
  loadMore: (limit?: number) => Promise<void>;
  loadMoreNewer: (limit?: number) => Promise<void>;
  markRead: (options?: MarkReadWrapperOptions) => void;
  removeMessage: (message: ChatMessageMessage) => void;
  retrySendMessage: RetrySendMessage;
  sendMessage: (
    message: MessageToSend,
    customMessageData?: Partial<ChatMessageMessage>,
    options?: SendMessageOptions
  ) => Promise<void>;
  updateMessage: (message: ChatMessageMessage) => void;
  startTyping?: () => void;
  stopTyping?: () => void;
};

export const {
  useStore: useChannelActionContext,
  Provider: ChannelActionProvider,
  Context: ChannelActionContext,
} = createContext<ChannelActionContextValue, ChannelActionContextValue>(
  (v) => v,
  'ChannelActionContext'
);
