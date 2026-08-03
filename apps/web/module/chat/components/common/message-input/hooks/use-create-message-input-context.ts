import { useMemo } from 'react';

import type { MessageInputContextValue } from '../../../../context/message-input-context';

export const useCreateMessageInputContext = (value: MessageInputContextValue) => {
  const {
    attachments,
    autocompleteTriggers,
    clearEditingState,
    disabled,
    disableMentions,
    emojiSearchIndex,
    focus,
    grow,
    handleChange,
    handleSubmit,
    hideSendButton,
    insertText,
    isUploadEnabled,
    maxFilesLeft,
    maxRows,
    mentioned_users,
    message,
    minRows,
    noFiles,
    numberOfUploads,
    onPaste,
    onSelectUser,
    openMentionsList,
    closeMentionsList,
    parent,
    publishTypingEvent,
    removeAttachments,
    setText,
    showMentionsList,
    text,
    textareaRef,
    uploadAttachment,
    uploadNewFiles,
    upsertAttachments,
  } = value;

  const editing = message?.editing;
  const mentionedUsersLength = mentioned_users.length;
  const parentId = parent?.id;

  const messageInputContext: MessageInputContextValue = useMemo(
    () => ({
      attachments,
      autocompleteTriggers,
      clearEditingState,
      closeMentionsList,
      disabled,
      disableMentions,
      emojiSearchIndex,
      focus,
      grow,
      handleChange,
      handleSubmit,
      hideSendButton,
      insertText,
      isUploadEnabled,
      maxFilesLeft,
      maxRows,
      mentioned_users,
      message,
      minRows,
      noFiles,
      numberOfUploads,
      onPaste,
      onSelectUser,
      openMentionsList,
      parent,
      publishTypingEvent,
      removeAttachments,
      setText,
      showMentionsList,
      text,
      textareaRef,
      uploadAttachment,
      uploadNewFiles,
      upsertAttachments,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      attachments,
      editing,
      emojiSearchIndex,
      handleSubmit,
      hideSendButton,
      isUploadEnabled,
      mentionedUsersLength,
      minRows,
      parentId,
      publishTypingEvent,
      removeAttachments,
      showMentionsList,
      text,
      uploadAttachment,
      upsertAttachments,
      isUploadEnabled,
    ]
  );

  return messageInputContext;
};
