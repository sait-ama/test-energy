import { createContext } from '@re/core/utils/create-context';

import {
  ChannelMemberSchema,
  ChannelSchema,
  MessageMessageEvent,
  MessageSchema,
} from '../model/types';
import type { MessageCustomType } from '../types/types';

export type ApiError = {
  code: number;
  message: string;
};

export type ChannelNotifications = Array<{
  id: string;
  text: string;
  type: 'success' | 'error';
}>;

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
}

export type MessageCustomExtends = {
  status?: MessageStatus;
  error?: ApiError;
  customType?: MessageCustomType;
  errorStatusCode?: number;
};

export enum ChannelCapability {
  MANAGE_MEMBERS = 'manageMembers',
  MANAGE_CHANNEL = 'manageChannel',
  LEAVE_CHANNEL = 'leaveChannel',
}

export type ChatMessageMessage = MessageMessageEvent & MessageCustomExtends;

export type ChatMessage = MessageSchema & MessageCustomExtends;

export type ChannelState = {
  suppressAutoscroll: boolean;
  error?: Error | null;
  hasMore?: boolean;
  hasMoreNewer?: boolean;
  highlightedMessageUuid?: string;
  loading?: boolean;
  loadingMore?: boolean;
  loadingMoreNewer?: boolean;
  members?: ChannelMemberSchema[];
  messages: ChatMessage[];
  read?: boolean;
  next?: string;
  previous?: string;
};

export type ChannelStateContextValue = ChannelState & {
  channel: ChannelSchema;
  multipleUploads: boolean;
  maxNumberOfFiles?: number;
  channelCapabilities: Record<ChannelCapability, boolean>;
  dragAndDropWindow?: boolean;
  acceptedFiles?: string[];
};

export const {
  useStore: useChannelStateContext,
  Provider: ChannelStateProvider,
  Context: ChannelStateContext,
} = createContext<ChannelStateContextValue, ChannelStateContextValue>(
  (v) => v,
  'ChannelStateContext'
);
