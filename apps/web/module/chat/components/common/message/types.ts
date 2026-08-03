import { ChatMessageMessage } from 'module/chat/context/channel-state-context';
import type { ChannelMemberSchema } from 'module/chat/model/types';

import type { ChannelActionContextValue } from '../../../context/channel-actions-context';
import type { MessageContextValue } from '../../../context/message-context';
import type { GroupStyle } from './../message-list/utils';
import { UserEventHandler } from './hooks/use-user-event-handler';
import type { MessageActionsArray } from './utils';

export type ReactEventHandler = (event: React.BaseSyntheticEvent) => Promise<void> | void;

export type MessageProps = {
  /** User object */
  user?: ChannelMemberSchema;
  /** The message object */
  message: ChatMessageMessage;
  /** Call this function to keep message list scrolled to the bottom when the scroll height increases, e.g. an element appears below the last message (only used in the `VirtualizedMessageList`) */
  autoscrollToBottom?: () => void;
  /** When true, the message is the last one in a group sent by a specific user (only used in the `VirtualizedMessageList`) */
  endOfGroup?: boolean;
  /** When true, the message is the first one in a group sent by a specific user (only used in the `VirtualizedMessageList`) */
  firstOfGroup?: boolean;
  /** If true, group messages sent by each user (only used in the `VirtualizedMessageList`) */
  groupedByUser?: boolean;
  /** A list of styles to apply to this message, i.e. top, bottom, single */
  groupStyles?: GroupStyle[];
  /** Whether to highlight and focus the message on load */
  highlighted?: boolean;
  /** Latest message id on current channel */
  lastReceivedId?: number | null;
  /** Array of allowed message actions (ex: ['edit', 'delete', 'forward', 'reply']). To disable all actions, provide an empty array. */
  messageActions?: MessageActionsArray;
  /** DOMRect object for parent MessageList component */
  messageListRect?: DOMRect;
  /** If true, only the sender of the message has editing privileges */
  onlySenderCanEdit?: boolean;
  /** Custom function to run on user avatar click */
  onUserClick?: UserEventHandler;
  /** Custom function to run on user avatar hover */
  onUserHover?: UserEventHandler;
  /** Custom retry send message handler to override default in [ChannelActionContext] */
  retrySendMessage?: ChannelActionContextValue['retrySendMessage'];
};

export type MessageUIComponentProps = Partial<MessageContextValue> & {
  user?: ChannelMemberSchema;
};
