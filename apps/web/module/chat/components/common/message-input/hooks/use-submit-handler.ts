import { useEffect, useRef } from 'react';

import { useChannelActionContext } from '../../../../context/channel-actions-context';
import { MessageSchema } from '../../../../model/types';
import type { Attachment, SendMessageOptions } from '../../../../types/types';
import type { MessageInputProps } from '../message-input';
import type { MessageInputReducerAction, MessageInputState } from './use-message-input-state';

export const useSubmitHandler = (
  props: MessageInputProps,
  state: MessageInputState,
  dispatch: React.Dispatch<MessageInputReducerAction>,
  numberOfUploads: number
) => {
  const { clearEditingState, message, parent, publishTypingEvent } = props;

  const { attachments, mentioned_users, text } = state;

  const { addNotification, editMessage, sendMessage, stopTyping } =
    useChannelActionContext('useSubmitHandler');

  const textReference = useRef({ hasChanged: false, initialText: text });

  useEffect(() => {
    if (!textReference.current.initialText.length) {
      textReference.current.initialText = text;
      return;
    }

    textReference.current.hasChanged = text !== textReference.current.initialText;
  }, [text]);

  const handleSubmit = async (
    event?: React.BaseSyntheticEvent,
    customMessageData?: Partial<MessageSchema>,
    options?: SendMessageOptions
  ) => {
    event?.preventDefault();
    const trimmedMessage = text.trim();
    const isEmptyMessage =
      trimmedMessage === '' ||
      trimmedMessage === '>' ||
      trimmedMessage === '``````' ||
      trimmedMessage === '``' ||
      trimmedMessage === '**' ||
      trimmedMessage === '____' ||
      trimmedMessage === '__' ||
      trimmedMessage === '****';

    if (isEmptyMessage && numberOfUploads === 0 && attachments.length === 0) return;

    const someAttachmentsUploading = attachments.some(
      (att) => att.localMetadata?.uploadState === 'uploading'
    );

    if (someAttachmentsUploading) {
      return addNotification('Нужно дождаться загрузки всех файлов', 'error');
    }

    const attachmentsFromUploads = attachments
      .filter((att) => att.localMetadata?.uploadState !== 'failed')
      .map((localAttachment) => {
        const { localMetadata: _, ...attachment } = localAttachment;
        return attachment as Attachment;
      });

    const sendOptions = { ...options };
    // let attachmentsFromLinkPreviews: Attachment[] = [];

    // const newAttachments = [...attachmentsFromUploads, ...attachmentsFromLinkPreviews];

    // Instead of checking if a user is still mentioned every time the text changes,
    // just filter out non-mentioned users before submit, which is cheaper
    // and allows users to easily undo any accidental deletion
    const actualMentionedUsers = Array.from(
      new Set(
        mentioned_users.filter(
          (user) => text.includes(`@${user.id}`) || text.includes(`@${user.username}`)
        )
      )
    );

    const updatedMessage = {
      files: attachmentsFromUploads,
      mentioned_users: actualMentionedUsers,
      text,
    };

    if (message && message.type !== 'error') {
      try {
        await editMessage(
          {
            ...message,
            ...updatedMessage,
            ...customMessageData,
          } as unknown as MessageSchema,
          sendOptions
        );

        clearEditingState?.();
        dispatch({ type: 'clear' });
      } catch {
        addNotification('Не удалось обновить сообщение', 'error');
      }
    } else {
      try {
        dispatch({ type: 'clear' });
        await sendMessage(
          {
            ...updatedMessage,
            parent,
          },
          customMessageData,
          sendOptions
        );

        if (publishTypingEvent) {
          stopTyping?.();
        }
      } catch {
        dispatch({
          getNewText: () => text,
          type: 'setText',
        });

        actualMentionedUsers?.forEach((user) => {
          dispatch({ type: 'addMentionedUser', user });
        });

        addNotification('Не удалось отправить сообщение', 'error');
      }
    }
  };

  return { handleSubmit };
};
