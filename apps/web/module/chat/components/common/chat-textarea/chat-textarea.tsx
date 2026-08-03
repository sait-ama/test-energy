import React, { useCallback } from 'react';

import { UserSchemaFragment } from '~shared/api/models/common';

import { useMessageInputContext } from '../../../context/message-input-context';
import { EmojiSearchIndex, EmojiSearchIndexResult } from '../message-input';
import type { TriggerSettings } from '../message-input/trigger-provider';
import { TextareaAutocomplete } from './textarea';

type ObjectUnion<T> = T[keyof T];

export type SuggestionUser = UserSchemaFragment;

export type SuggestionEmoji = EmojiSearchIndexResult;

export type SuggestionItem = SuggestionUser | SuggestionEmoji;

export type SuggestionItemProps = {
  className: string;
  component: React.ComponentType<{
    entity: SuggestionItem;
    selected: boolean;
  }>;
  item: SuggestionItem;
  key: React.Key;
  onClickHandler: (event: React.BaseSyntheticEvent, item: SuggestionItem) => void;
  onSelectHandler: (item: SuggestionItem) => void;
  selected: boolean;
  style: React.CSSProperties;
  value: string;
};

export interface SuggestionHeaderProps {
  currentTrigger: string;
  value: string;
}

export type SuggestionListProps = ObjectUnion<{
  [key in keyof TriggerSettings]: {
    component: TriggerSettings[key]['component'];
    currentTrigger: string;
    dropdownScroll: (element: HTMLDivElement) => void;
    getSelectedItem: ((item: Parameters<TriggerSettings[key]['output']>[0]) => void) | null;
    getTextToReplace: (item: Parameters<TriggerSettings[key]['output']>[0]) => {
      caretPosition: 'start' | 'end' | 'next' | number;
      text: string;
      key?: string;
    };
    Header: React.ComponentType<SuggestionHeaderProps>;
    onSelect: (newToken: {
      caretPosition: 'start' | 'end' | 'next' | number;
      text: string;
    }) => void;
    selectionEnd: number;
    SuggestionItem: React.ComponentType<SuggestionItemProps>;
    values: Parameters<Parameters<TriggerSettings[key]['dataProvider']>[2]>[0];
    className?: string;
    itemClassName?: string;
    itemStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    value?: string;
  };
}>;

export type ChatAutoCompleteProps = {
  /** Override the default disabled state of the underlying `textarea` component. */
  disabled?: boolean;
  /** Function to override the default submit handler on the underlying `textarea` component */
  handleSubmit?: (event: React.BaseSyntheticEvent) => void;
  /** Function to run on blur of the underlying `textarea` component */
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** Function to override the default onChange behavior on the underlying `textarea` component */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  /** Function to run on focus of the underlying `textarea` component */
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** Function to override the default onPaste behavior on the underlying `textarea` component */
  onPaste?: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  /** Placeholder for the underlying `textarea` component */
  placeholder?: string;
  /** The initial number of rows for the underlying `textarea` component */
  rows?: number;
  /** The text value of the underlying `textarea` component */
  value?: string;
  /** Function to override the default emojiReplace behavior on the `wordReplace` prop of the `textarea` component */
  wordReplace?: (word: string, emojiIndex?: EmojiSearchIndex) => string;
};

const UnMemoizedChatAutoComplete = (props: ChatAutoCompleteProps) => {
  const messageInput = useMessageInputContext('ChatAutoComplete');
  const { disabled, emojiSearchIndex, textareaRef: innerRef } = messageInput;

  const placeholder = props.placeholder || 'Сообщение...';

  const emojiReplace = props.wordReplace
    ? (word: string) => props.wordReplace?.(word, emojiSearchIndex)
    : async (word: string) => {
        const found = (await emojiSearchIndex?.search(word)) || [];

        const emoji = found
          .filter(Boolean)
          .slice(0, 10)
          .find(({ emoticons }) => !!emoticons?.includes(word));

        if (!emoji) return null;

        const [firstSkin] = emoji.skins ?? [];

        return emoji.native ?? firstSkin.native;
      };

  const updateInnerRef = useCallback(
    (ref: HTMLTextAreaElement | null) => {
      if (innerRef) {
        innerRef.current = ref;
      }
    },
    [innerRef]
  );

  return (
    <TextareaAutocomplete
      aria-label={placeholder}
      className="w-full"
      closeMentionsList={messageInput.closeMentionsList}
      containerClassName="w-full"
      disabled={props.disabled ?? disabled}
      disableMentions={messageInput.disableMentions}
      grow={messageInput.grow}
      handleSubmit={props.handleSubmit || messageInput.handleSubmit}
      innerRef={updateInnerRef}
      maxRows={messageInput.maxRows}
      minChar={0}
      minRows={messageInput.minRows}
      onBlur={props.onBlur}
      onChange={props.onChange || messageInput.handleChange}
      onFocus={props.onFocus}
      onPaste={props.onPaste || messageInput.onPaste}
      placeholder={placeholder}
      replaceWord={emojiReplace}
      rows={props.rows || 1}
      showMentionsList={messageInput.showMentionsList}
      // SuggestionItem={SuggestionItem}
      // SuggestionList={SuggestionList}
      trigger={messageInput.autocompleteTriggers || {}}
      value={props.value || messageInput.text}
    />
  );
};

export const ChatAutoComplete = React.memo(
  UnMemoizedChatAutoComplete
) as typeof UnMemoizedChatAutoComplete;
