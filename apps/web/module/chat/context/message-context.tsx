import React from 'react';

import { createContext } from '@re/core/utils/create-context';

import type { ActionHandlerReturnType } from '../components/common/message/hooks/use-action-handler';
import type { ReactEventHandler } from '../components/common/message/types';
import type { MessageActionsArray } from '../components/common/message/utils';
import type { GroupStyle } from '../components/common/message-list/utils';
import type { ChannelActionContextValue } from './channel-actions-context';
import { ChatMessage, ChatMessageMessage } from './channel-state-context';

export type CustomMessageActions = {
  [key: string]: (message: ChatMessage, event: React.BaseSyntheticEvent) => Promise<void> | void;
};

export type MessageContextValue = {
  /** If actions such as edit, delete, flag, mute are enabled on Message */
  actionsEnabled: boolean;
  /** Function to exit edit state */
  clearEditingState: (event?: React.BaseSyntheticEvent) => void;
  sending?: boolean;
  /** If the Message is in edit state */
  editing: boolean;
  /**
   * Returns all allowed actions on message by current user e.g., ['edit', 'delete', 'forward', 'react', 'reply'].
   */
  getMessageActions: () => MessageActionsArray<string>;
  /** Function to send an action in a Channel */
  handleAction: ActionHandlerReturnType;
  /** Function to delete a message in a Channel */
  handleDelete: ReactEventHandler;
  /** Function to edit a message in a Channel */
  handleEdit: ReactEventHandler;
  /** Function to retry sending a Message */
  handleRetry: ChannelActionContextValue['retrySendMessage'];
  /** Function that returns whether the Message belongs to the current user */
  isMyMessage: () => boolean;
  /** The message object */
  message: ChatMessageMessage;
  /** Handler function for a click event on the user that posted the Message */
  onUserClick: ReactEventHandler;
  /** Handler function for a hover event on the user that posted the Message */
  onUserHover: ReactEventHandler;
  /** Function to toggle the edit state on a Message */
  setEditingState: ReactEventHandler;
  /** Call this function to keep message list scrolled to the bottom when the scroll height increases, e.g. an element appears below the last message (only used in the `VirtualizedMessageList`) */
  autoscrollToBottom?: () => void;
  /** Object containing custom message actions and function handlers */
  customMessageActions?: CustomMessageActions;
  /** If true, the message is the last one in a group sent by a specific user (only used in the `VirtualizedMessageList`) */
  endOfGroup?: boolean;
  /** If true, the message is the first one in a group sent by a specific user (only used in the `VirtualizedMessageList`) */
  firstOfGroup?: boolean;
  /** If true, group messages sent by each user (only used in the `VirtualizedMessageList`) */
  groupedByUser?: boolean;
  /** A list of styles to apply to this message, ie. top, bottom, single */
  groupStyles?: GroupStyle[];
  /** Whether to highlight and focus the message on load */
  highlighted?: boolean;
  /** Latest message id on current channel */
  lastReceivedUuild?: string | null;
  /** Indicates whether a message has not been read yet or has been marked unread */
  messageIsUnread: boolean;
};

export const {
  useStore: useMessageContext,
  Provider: MessageProvider,
  Context: MessageContext,
} = createContext<MessageContextValue, MessageContextValue>((v) => v, 'MessageContext');
