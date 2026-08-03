import React, { Reducer, useCallback, useReducer, useState } from 'react';

import { customAlphabet } from 'nanoid';

import { UserSchemaFragment } from '~shared/api/models/user';

import { ChatMessage, useChannelStateContext } from '../../../../context/channel-state-context';
import { MessageMessageData } from '../../../../model/types';
import type { Attachment, SendMessageOptions } from '../../../../types/types';
import { mergeDeep } from '../../../../utils/merge-deep';
import type { MessageInputProps } from '../message-input';
import type { LocalAttachment } from '../types';
import { useAttachments } from './use-attachments';
import { useMessageInputText } from './use-message-input-text';
import { usePasteHandler } from './use-paste-handler';
import { useSubmitHandler } from './use-submit-handler';
export type MessageInputState = {
  attachments: LocalAttachment[];
  mentioned_users: UserSchemaFragment[];
  setText: (text: string) => void;
  text: string;
};

type UpsertAttachmentsAction = {
  attachments: LocalAttachment[];
  type: 'upsertAttachments';
};

type RemoveAttachmentsAction = {
  ids: number[];
  type: 'removeAttachments';
};

type SetTextAction = {
  getNewText: (currentStateText: string) => string;
  type: 'setText';
};

type ClearAction = {
  type: 'clear';
};

type AddMentionedUserAction = {
  type: 'addMentionedUser';
  user: UserSchemaFragment;
};

export type MessageInputReducerAction =
  | SetTextAction
  | ClearAction
  | AddMentionedUserAction
  | UpsertAttachmentsAction
  | RemoveAttachmentsAction;

export type MessageInputHookProps = {
  handleChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  handleSubmit: (
    event?: React.BaseSyntheticEvent,
    customMessageData?: Partial<ChatMessage>,
    options?: SendMessageOptions
  ) => void;
  insertText: (textToInsert: string) => void;
  isUploadEnabled: boolean;
  maxFilesLeft: number;
  numberOfUploads: number;
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onSelectUser: (item: UserSchemaFragment) => void;
  removeAttachments: (ids: number[]) => void;
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null | undefined>;
  uploadAttachment: (attachment: LocalAttachment) => Promise<LocalAttachment | undefined>;
  uploadNewFiles: (files: FileList | File[]) => void;
  upsertAttachments: (attachments: (Attachment | LocalAttachment)[]) => void;
};

const makeEmptyMessageInputState = (): MessageInputState => ({
  attachments: [],
  mentioned_users: [],
  setText: () => null,
  text: '',
});

const initState = (
  message?: Pick<MessageMessageData, 'attachments' | 'text'> & {
    mentioned_users?: UserSchemaFragment[];
  }
): MessageInputState => {
  if (!message) {
    return makeEmptyMessageInputState();
  }

  const attachments =
    message.attachments
      ?.filter(({ url }) => !url)
      .map(
        (att) =>
          ({
            ...att,
            localMetadata: { id: parseInt(customAlphabet('1234567890', 18)()) },
          }) as LocalAttachment
      ) || [];

  const mentioned_users: UserSchemaFragment[] = message.mentioned_users || [];

  return {
    attachments,
    mentioned_users,
    setText: () => null,
    text: message.text || '',
  };
};

/**
 * MessageInput state reducer
 */
const messageInputReducer = (state: MessageInputState, action: MessageInputReducerAction) => {
  switch (action.type) {
    case 'setText':
      return { ...state, text: action.getNewText(state.text) };

    case 'clear':
      return makeEmptyMessageInputState();

    case 'upsertAttachments': {
      const attachments = [...state.attachments];
      action.attachments.forEach((actionAttachment) => {
        const attachmentIndex = state.attachments.findIndex(
          (att) =>
            att.localMetadata?.id && att.localMetadata?.id === actionAttachment.localMetadata?.id
        );

        if (attachmentIndex === -1) {
          attachments.push(actionAttachment);
        } else {
          const upsertedAttachment = mergeDeep(
            state.attachments[attachmentIndex] ?? {},
            actionAttachment
          );
          attachments.splice(attachmentIndex, 1, upsertedAttachment);
        }
      });

      return {
        ...state,
        attachments,
      };
    }

    case 'removeAttachments': {
      // console.log('removeAttachments', action.ids);
      return {
        ...state,
        attachments: state.attachments.filter((att) => !action.ids.includes(att.localMetadata?.id)),
      };
    }

    case 'addMentionedUser':
      return {
        ...state,
        mentioned_users: state.mentioned_users.concat(action.user),
      };

    default:
      return state;
  }
};

export type MentionsListState = {
  closeMentionsList: () => void;
  openMentionsList: () => void;
  showMentionsList: boolean;
};

/**
 * hook for MessageInput state
 */
export const useMessageInputState = (
  props: MessageInputProps
): MessageInputState & MessageInputHookProps & MentionsListState => {
  const { getDefaultValue, message } = props;

  const { channelCapabilities = {} } = useChannelStateContext('useMessageInputState');

  const defaultValue = getDefaultValue?.();

  const initialStateValue =
    message ||
    ((Array.isArray(defaultValue)
      ? { text: defaultValue.join('') }
      : { text: defaultValue?.toString() }) as Partial<ChatMessage>);

  const [state, dispatch] = useReducer(
    messageInputReducer as Reducer<MessageInputState, MessageInputReducerAction>,
    initialStateValue,
    initState
  );

  const { handleChange, insertText, textareaRef } = useMessageInputText(props, state, dispatch);

  const [showMentionsList, setShowMentionsList] = useState(false);

  const openMentionsList = () => {
    dispatch({
      getNewText: (currentText) => currentText + '@',
      type: 'setText',
    });
    setShowMentionsList(true);
  };

  const closeMentionsList = () => setShowMentionsList(false);

  const {
    maxFilesLeft,
    numberOfUploads,
    removeAttachments,
    uploadAttachment,
    uploadNewFiles,
    upsertAttachments,
  } = useAttachments(props, state, dispatch, textareaRef);

  const { handleSubmit } = useSubmitHandler(props, state, dispatch, numberOfUploads);

  const isUploadEnabled = !!channelCapabilities['upload-file'];

  const { onPaste } = usePasteHandler(uploadNewFiles, insertText, isUploadEnabled);

  const onSelectUser = useCallback((item: UserSchemaFragment) => {
    dispatch({ type: 'addMentionedUser', user: item });
  }, []);

  const setText = useCallback((text: string) => {
    dispatch({ getNewText: () => text, type: 'setText' });
  }, []);

  return {
    ...state,
    closeMentionsList,
    handleChange,
    handleSubmit,
    insertText,
    isUploadEnabled,
    maxFilesLeft,
    numberOfUploads,
    onPaste,
    onSelectUser,
    openMentionsList,
    removeAttachments,
    setText,
    showMentionsList,
    textareaRef,
    uploadAttachment,
    uploadNewFiles,
    upsertAttachments,
  };
};
