import React, { PropsWithChildren } from 'react';

import data from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';

import { ChatMessage } from '../../../context';
import { useChannelStateContext } from '../../../context/channel-state-context';
import { MessageInputContextProvider } from '../../../context/message-input-context';
import type { UnknownType } from '../../../types/types';
import { useCreateMessageInputContext } from './hooks/use-create-message-input-context';
import { useMessageInputState } from './hooks/use-message-input-state';
import { MessageInputCompose } from './message-input-compose';
import { TriggerProvider } from './trigger-provider';

init({ data });

export type EmojiSearchIndexResult = {
  id: string;
  name: string;
  skins: Array<{ native: string }>;
  emoticons?: Array<string>;
  native?: string;
};

export interface EmojiSearchIndex<T extends UnknownType = UnknownType> {
  search: (
    query: string
  ) => PromiseLike<Array<EmojiSearchIndexResult & T>> | Array<EmojiSearchIndexResult & T> | null;
}

export type MessageInputProps = {
  /** Function to clear the editing state while editing a message */
  clearEditingState?: () => void;
  /** If true, disables the text input */
  disabled?: boolean;
  /** If true, the suggestion list will not display and autocomplete @mentions. Default: false. */
  disableMentions?: boolean;
  /** Mechanism to be used with autocomplete and text replace features of the `MessageInput` component, see [emoji-mart `SearchIndex`](https://github.com/missive/emoji-mart#%EF%B8%8F%EF%B8%8F-headless-search) */
  emojiSearchIndex?: EmojiSearchIndex;
  /** Custom error handler function to be called with a file/image upload fails */
  /** If true, focuses the text input on component mount */
  focus?: boolean;
  /** Generates the default value for the underlying textarea element. The function's return value takes precedence before additionalTextareaProps.defaultValue. */
  getDefaultValue?: () => string | string[];
  /** If true, expands the text input vertically for new lines */
  grow?: boolean;
  /** Allows to hide MessageInput's send button. */
  hideSendButton?: boolean;
  /** Max number of rows the underlying `textarea` component is allowed to grow */
  maxRows?: number;
  /** If provided, the existing message will be edited on submit */
  message?: ChatMessage;
  /** Min number of rows the underlying `textarea` will start with. The `grow` on MessageInput prop has to be enabled for `minRows` to take effect. */
  minRows?: number;
  /** If true, disables file uploads for all attachments except for those with type 'image'. Default: false */
  noFiles?: boolean;
  /** When replying in a thread, the parent message object */
  parent?: ChatMessage;
  /** If true, triggers typing stores on text input keystroke */
  publishTypingEvent?: boolean;
  isUploadEnabled?: boolean;
};

export const MessageInputProvider = (props: PropsWithChildren<MessageInputProps>) => {
  const messageInputState = useMessageInputState(props);

  const messageInputContextValue = useCreateMessageInputContext({
    ...messageInputState,
    ...props,
    maxRows: props.maxRows ?? 5,
    emojiSearchIndex: props.emojiSearchIndex ?? SearchIndex,
  });

  return (
    <MessageInputContextProvider value={messageInputContextValue}>
      {props.children}
    </MessageInputContextProvider>
  );
};

const UnMemoizedMessageInput = (props: MessageInputProps) => {
  const { dragAndDropWindow } = useChannelStateContext();

  if (dragAndDropWindow)
    return (
      <TriggerProvider>
        <MessageInputCompose />
      </TriggerProvider>
    );

  return (
    <MessageInputProvider {...props}>
      <TriggerProvider>
        <MessageInputCompose />
      </TriggerProvider>
    </MessageInputProvider>
  );
};

export const MessageInput = React.memo(UnMemoizedMessageInput) as typeof UnMemoizedMessageInput;
