import { RoomEventDiscriminator, RoomMemberEventMessage } from 'module/chat/model/types';
import { generateTimeBasedUuid } from 'module/chat/utils/uuid';

import { CUSTOM_MESSAGE_TYPE } from '../../../constants/messageTypes';
import {
  ChatMessage,
  ChatMessageMessage,
  MessageStatus,
} from '../../../context/channel-state-context';
import { MessageLabel } from '../../../types/types';
import { isDate } from '../../../utils/is-date';
import { isMessageEdited } from '../message/utils';

type ProcessMessagesContext = {
  enableDateSeparator?: boolean;
  hideDeletedMessages?: boolean;
};

export type ProcessMessagesParams = ProcessMessagesContext & {
  messages: ChatMessage[];
  userId?: number;
};

export const processMessages = (params: ProcessMessagesParams) => {
  const { messages, ...context } = params;
  const { enableDateSeparator } = context;

  let lastDateSeparator;
  const newMessages: ChatMessage[] = [];

  // TODO: Исправить с учетом изменений в типе MessageSchema
  for (let i = 0; i < messages.length; i += 1) {
    const message = messages[i]!;

    const changes: ChatMessage[] = [];

    const messageDate =
      (message.created_at &&
        isDate(message.created_at) &&
        new Date(message.created_at).toDateString()) ||
      '';

    const previousMessage = messages[i - 1];
    let prevMessageDate = messageDate;

    if (enableDateSeparator && previousMessage?.created_at && isDate(previousMessage.created_at)) {
      prevMessageDate = new Date(previousMessage.created_at).toDateString();
    }

    if (
      enableDateSeparator &&
      (i === 0 || // always put date separator before the first message
        messageDate !== prevMessageDate) && // add date separator btw. 2 messages created on different date
      // if hiding deleted messages replace the previous deleted message(s) with A separator if the last rendered message was created on different date
      changes[changes.length - 1]?.customType !== CUSTOM_MESSAGE_TYPE.date // do not show two date separators in a row)
    ) {
      // lastDateSeparator = messageDate;

      changes.push(
        {
          customType: CUSTOM_MESSAGE_TYPE.date,
          date: message.created_at,
          uuid: generateTimeBasedUuid(),
        } as ChatMessage,
        message
      );
    } else {
      changes.push(message);
    }

    newMessages.push(...changes);
  }

  return newMessages;
};

export type GroupStyle = '' | 'middle' | 'top' | 'bottom' | 'single';

function nonMessageType(message: ChatMessage): boolean {
  return (
    message.discriminator !== RoomEventDiscriminator.MESSAGE ||
    message.customType === CUSTOM_MESSAGE_TYPE.intro ||
    message.customType === CUSTOM_MESSAGE_TYPE.date
  );
}

export const getGroupStyles = (
  message: ChatMessage,
  previousMessage?: ChatMessage,
  nextMessage?: ChatMessage,
  noGroupByUser?: boolean,
  maxTimeBetweenGroupedMessages?: number
): GroupStyle => {
  if (nonMessageType(message)) return '';

  if (noGroupByUser) return 'single';

  const isTopMessage =
    !previousMessage ||
    nonMessageType(previousMessage) ||
    previousMessage.status === MessageStatus.FAILED ||
    message.user_id !== previousMessage.user_id ||
    isMessageEdited(previousMessage as ChatMessageMessage);

  const isBottomMessage =
    !nextMessage ||
    nonMessageType(nextMessage) ||
    nextMessage.status === MessageStatus.FAILED ||
    message.user_id !== nextMessage.user_id ||
    isMessageEdited(nextMessage as ChatMessageMessage);

  if (!isTopMessage && !isBottomMessage) {
    if (message.status === MessageStatus.FAILED) return 'single';
    return 'middle';
  }

  if (isBottomMessage) {
    if (isTopMessage || message.status === MessageStatus.FAILED) return 'single';
    return 'bottom';
  }

  if (isTopMessage) return 'top';

  return '';
};

export type DateSeparatorMessage = {
  customType: typeof CUSTOM_MESSAGE_TYPE.date;
  date: Date;
  uuid: string;
  type: MessageLabel;
};

export function isDateSeparatorMessage(message: any): message is DateSeparatorMessage {
  return message.customType === CUSTOM_MESSAGE_TYPE.date && !!message.date && isDate(message.date);
}

export function isRoomMemberEventMessage(message: ChatMessage): message is RoomMemberEventMessage {
  return message.discriminator === RoomEventDiscriminator.MEMBER_JOIN;
}
