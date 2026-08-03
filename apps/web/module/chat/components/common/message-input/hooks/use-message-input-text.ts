import { useCallback, useEffect, useRef } from 'react';

import { useChannelActionContext } from 'module/chat/context/channel-actions-context';

import { DEFAULT_MAX_MESSAGE_LENGTH } from '../../../../constants/limits';
import { useChannelStateContext } from '../../../../context/channel-state-context';
import type { MessageInputProps } from '../message-input';
import type { MessageInputReducerAction, MessageInputState } from './use-message-input-state';

export const useMessageInputText = (
  props: MessageInputProps,
  state: MessageInputState,
  dispatch: React.Dispatch<MessageInputReducerAction>
) => {
  const { channel } = useChannelStateContext('useMessageInputText');
  const { focus, parent, publishTypingEvent } = props;
  const { text } = state;
  const { startTyping } = useChannelActionContext('useMessageInputText');

  const textareaRef = useRef<HTMLTextAreaElement>(undefined);

  // Focus
  useEffect(() => {
    if (focus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [focus]);

  // Text + cursor position
  const newCursorPosition = useRef<number>(undefined);

  const insertText = useCallback(
    (textToInsert: string) => {
      const maxLength = DEFAULT_MAX_MESSAGE_LENGTH;

      if (!textareaRef.current) {
        return dispatch({
          getNewText: (text) => {
            const updatedText = text + textToInsert;
            if (maxLength && updatedText.length > maxLength) {
              return updatedText.slice(0, maxLength);
            }
            return updatedText;
          },
          type: 'setText',
        });
      }

      const { selectionEnd, selectionStart } = textareaRef.current;
      newCursorPosition.current = selectionStart + textToInsert.length;

      dispatch({
        getNewText: (prevText) => {
          const updatedText =
            prevText.slice(0, selectionStart) + textToInsert + prevText.slice(selectionEnd);

          if (maxLength && updatedText.length > maxLength) {
            return updatedText.slice(0, maxLength);
          }

          return updatedText;
        },
        type: 'setText',
      });
    },
    [newCursorPosition, textareaRef]
  );

  useEffect(() => {
    const textareaElement = textareaRef.current;
    if (textareaElement && newCursorPosition.current !== undefined) {
      textareaElement.selectionStart = newCursorPosition.current;
      textareaElement.selectionEnd = newCursorPosition.current;
      newCursorPosition.current = undefined;
    }
  }, [text, newCursorPosition]);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      event.preventDefault();
      if (!event || !event.target) {
        return;
      }

      const newText = event.target.value;
      dispatch({
        getNewText: () => newText,
        type: 'setText',
      });

      if (publishTypingEvent && newText && channel) {
        startTyping?.();
        // logChatPromiseExecution(channel.keystroke(parent?.id), 'start typing event');
      }
    },
    [channel, parent, publishTypingEvent]
  );

  return {
    handleChange,
    insertText,
    textareaRef,
  };
};
