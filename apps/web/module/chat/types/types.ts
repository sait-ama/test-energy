import type { PropsWithChildren } from 'react';

import type { LoadingIndicatorProps } from '../components/ui/loading-indicator';
import { AttachmentSchema, ChannelSchema, MessageSchema, MessageUserSchema } from '../model/types';

export type UnknownType = Record<string, unknown>;
export type PropsWithChildrenOnly = PropsWithChildren<Record<never, never>>;

// TODO: remove this type
export type CustomTrigger = {
  [key: string]: {
    componentProps: UnknownType;
    data: UnknownType;
  };
};

export type PaginatorProps = {
  /** callback to load the next page */
  loadNextPage: () => void;
  /** indicates if there is a next page to load */
  hasNextPage?: boolean;
  /** indicates if there is a previous page to load */
  hasPreviousPage?: boolean;
  /** indicates whether a loading request is in progress */
  isLoading?: boolean;
  /** The loading indicator to use */
  LoadingIndicator?: React.ComponentType<LoadingIndicatorProps>;
  /** callback to load the previous page */
  loadPreviousPage?: () => void;
  /** display the items in opposite order */
  reverse?: boolean;
  /** Offset from when to start the loadNextPage call */
  threshold?: number;
};

export type Dimensions = { height?: string; width?: string };

export type SendMessageOptions = {
  is_pending_message?: boolean;
  keep_channel_hidden?: boolean;
  pending?: boolean;
  pending_message_metadata?: Record<string, string>;
  skip_enrich_url?: boolean;
  skip_push?: boolean;
};

export type Readable<T> = {
  [key in keyof T]: T[key];
} & {};

export type ValuesType<T> = T[keyof T];

export type PartialSelected<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};

export type Event = any;

export type UpdateMessageOptions = {};

export type MessageLabel = 'error' | 'regular' | 'reply';

export type MessageCustomType = 'message.date' | 'channel.intro';

export type MessageResponse = MessageSchema;

export type ChannelResponse = ChannelSchema & {};

export type UserResponse = MessageUserSchema;

export type Attachment = AttachmentSchema & { type?: string };
