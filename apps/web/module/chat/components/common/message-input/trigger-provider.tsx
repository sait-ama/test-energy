import React, { PropsWithChildren } from 'react';

import {
  MessageInputContextProvider,
  useMessageInputContext,
} from '../../../context/message-input-context';
import type { UnknownType } from '../../../types/types';
import type { SuggestionUser } from '../chat-textarea/chat-textarea';
import type { EmoticonItemProps } from '../emoticon-item';
import type { UserSuggestionItemProps } from '../user-item';
import { useEmojiTrigger } from './hooks/use-emoji-trigger';
import { useUserTrigger } from './hooks/use-user-trigger';

export type AutocompleteMinimalData = {
  id?: number;
  name?: string;
  username?: string;
} & ({ id: number } | { name: string } | { username: string });

export type EmojiTriggerSetting = TriggerSetting<EmoticonItemProps>;

export type UserTriggerSetting = TriggerSetting<UserSuggestionItemProps, SuggestionUser>;

export type TriggerSetting<T extends UnknownType = UnknownType, U = UnknownType> = {
  component: string | React.ComponentType<T>;
  dataProvider: (
    query: string,
    text: string,
    onReady: (data: (U & AutocompleteMinimalData)[], token: string) => void
  ) => U[] | PromiseLike<void> | void;
  output: (entity: U) =>
    | {
        caretPosition: 'start' | 'end' | 'next' | number;
        text: string;
        key?: number;
      }
    | string
    | null;
  callback?: (item: U) => void;
};

export type TriggerSettings = {
  ':': EmojiTriggerSetting;
  '@': UserTriggerSetting;
};

export const TriggerProvider = ({ children }: PropsWithChildren<Record<string, unknown>>) => {
  const currentValue = useMessageInputContext('TriggerProvider');

  const defaultAutocompleteTriggers: TriggerSettings = {
    ':': useEmojiTrigger(currentValue.emojiSearchIndex),
    '@': useUserTrigger({
      disableMentions: currentValue.disableMentions,
      onSelectUser: currentValue.onSelectUser,
    }),
  };

  const newValue = {
    ...currentValue,
    autocompleteTriggers: defaultAutocompleteTriggers,
  };

  return <MessageInputContextProvider value={newValue}>{children}</MessageInputContextProvider>;
};
