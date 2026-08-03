import deepequal from 'react-fast-compare';

import emojiRegex from 'emoji-regex';

import type {
  ChatMessageMessage,
  CustomMessageActions,
  MessageContextValue,
} from '../../../context';
import type { UserResponse } from '../../../types';
import type { CustomMessageActionsListProps } from '../message-actions/custom-message-actions-list';
import type { MessageProps } from './types';

/**
 * Following function validates a function which returns notification message.
 * It validates if the first parameter is function and also if return value of function is string or no.
 */
export const validateAndGetMessage = <T extends unknown[]>(
  func: (...args: T) => unknown,
  args: T
) => {
  if (!func || typeof func !== 'function') return null;

  // below is due to tests passing a single argument
  // rather than an array.
  if (!Array.isArray(args)) {
    args = [args] as unknown as T;
  }

  const returnValue = func(...args);

  if (typeof returnValue !== 'string') return null;

  return returnValue;
};

export const MESSAGE_ACTIONS = {
  delete: 'delete',
  edit: 'edit',
  react: 'react',
  reply: 'reply',
  forward: 'forward',
};

export type MessageActionsArray<T extends string = string> = Array<
  keyof typeof MESSAGE_ACTIONS | T
>;

export type Capabilities = {
  canDelete?: boolean;
  canEdit?: boolean;
  canReply?: boolean;
  canForward?: boolean;
};

export const getMessageActions = (
  actions: MessageActionsArray | boolean,
  { canDelete, canEdit, canReply, canForward }: Capabilities
): MessageActionsArray => {
  const messageActionsAfterPermission: MessageActionsArray = [];
  let messageActions: MessageActionsArray = [];

  if (actions && typeof actions === 'boolean') {
    // If value of actions is true, then populate all the possible values
    messageActions = Object.keys(MESSAGE_ACTIONS);
  } else if (actions && actions.length > 0) {
    messageActions = [...actions];
  } else {
    return [];
  }

  if (canDelete && messageActions.indexOf(MESSAGE_ACTIONS.delete) > -1) {
    messageActionsAfterPermission.push(MESSAGE_ACTIONS.delete);
  }

  if (canEdit && messageActions.indexOf(MESSAGE_ACTIONS.edit) > -1) {
    messageActionsAfterPermission.push(MESSAGE_ACTIONS.edit);
  }

  if (canReply && messageActions.indexOf(MESSAGE_ACTIONS.reply) > -1) {
    messageActionsAfterPermission.push(MESSAGE_ACTIONS.reply);
  }

  if (canForward && messageActions.indexOf(MESSAGE_ACTIONS.forward) > -1) {
    messageActionsAfterPermission.push(MESSAGE_ACTIONS.forward);
  }

  return messageActionsAfterPermission;
};
export const shouldRenderMessageActions = ({
  customMessageActions,
  CustomMessageActionsList,
  messageActions,
}: {
  messageActions: MessageActionsArray;
  customMessageActions?: CustomMessageActions;
  CustomMessageActionsList?: React.ComponentType<CustomMessageActionsListProps>;
  inThread?: boolean;
}) => {
  if (
    typeof CustomMessageActionsList !== 'undefined' ||
    typeof customMessageActions !== 'undefined'
  )
    return true;

  if (!messageActions.length) return false;

  if (
    messageActions.length === 1 &&
    (messageActions.includes(MESSAGE_ACTIONS.react) ||
      messageActions.includes(MESSAGE_ACTIONS.reply))
  ) {
    return false;
  }

  if (
    messageActions.length === 2 &&
    messageActions.includes(MESSAGE_ACTIONS.react) &&
    messageActions.includes(MESSAGE_ACTIONS.reply)
  ) {
    return false;
  }

  return true;
};

function areMessagesEqual(
  prevMessage: ChatMessageMessage,
  nextMessage: ChatMessageMessage
): boolean {
  return (
    prevMessage.status === nextMessage.status &&
    prevMessage.text === nextMessage.text &&
    prevMessage.attachments === nextMessage.attachments
  );
}

export const areMessagePropsEqual = (prevProps: MessageProps, nextProps: MessageProps) => {
  const { message: prevMessage } = prevProps;
  const { message: nextMessage } = nextProps;

  if (prevProps.endOfGroup !== nextProps.endOfGroup) return false;

  const messagesAreEqual = areMessagesEqual(prevMessage, nextMessage);
  if (!messagesAreEqual) return false;

  const deepEqualProps =
    deepequal(nextProps.messageActions, prevProps.messageActions) &&
    deepequal(nextProps.highlighted, prevProps.highlighted) &&
    deepequal(nextProps.groupStyles, prevProps.groupStyles) && // last 3 messages can have different group styles
    deepequal(nextProps.lastReceivedId, prevProps.lastReceivedId);

  if (!deepEqualProps) return false;

  return (
    prevProps.messageListRect === nextProps.messageListRect // MessageList wrapper layout changes
  );
};

export const areMessageUIPropsEqual = (
  prevProps: MessageContextValue,
  nextProps: MessageContextValue
) => {
  const { lastReceivedUuild: prevLastReceivedUuild, message: prevMessage } = prevProps;
  const { lastReceivedUuild: nextLastReceivedUuild, message: nextMessage } = nextProps;

  if (prevProps.editing !== nextProps.editing) return false;
  if (prevProps.highlighted !== nextProps.highlighted) return false;
  if (prevProps.endOfGroup !== nextProps.endOfGroup) return false;
  if (prevProps.groupStyles !== nextProps.groupStyles) return false;

  if (
    (prevMessage.uuid === prevLastReceivedUuild || prevMessage.uuid === nextLastReceivedUuild) &&
    prevLastReceivedUuild !== nextLastReceivedUuild
  ) {
    return false;
  }

  return areMessagesEqual(prevMessage, nextMessage);
};

export const messageHasAttachments = (message?: ChatMessageMessage) =>
  !!message?.attachments && !!message.attachments.length;

export const getImages = (message?: ChatMessageMessage) => {
  if (!message?.attachments) {
    return [];
  }
  return message.attachments.filter(({ media_type }) => media_type === 'image');
};

export const getNonImageAttachments = (message?: ChatMessageMessage) => {
  if (!message?.attachments) {
    return [];
  }
  return message.attachments.filter(({ media_type }) => media_type !== 'image');
};

export interface TooltipUsernameMapper {
  (user: UserResponse): number | string;
}

/**
 * Default Tooltip Username mapper implementation.
 *
 * @param user the user.
 */
export const mapToUserNameOrId: TooltipUsernameMapper = (user) => user?.username || user.id;

/**
 * Check if a character is an emoji.
 * This uses both the emoji-regex and checks for characters in the Unicode astral planes
 * where most emojis are defined, helping to catch newer emojis that might not be in older regex versions.
 */
const isEmojiChar = (char: string) => {
  // Use the emoji-regex library
  const emojiRe = emojiRegex();
  if (emojiRe.test(char)) return true;

  // Additional check for characters in astral planes (most emojis are in these ranges)
  // This helps catch newer emojis that might not be in the regex library yet
  const codePoint = char.codePointAt(0);
  if (!codePoint) return false;

  // Emoji ranges
  return (
    // Miscellaneous symbols and pictographs (U+1F300–1F5FF)
    (codePoint >= 0x1f300 && codePoint <= 0x1f5ff) ||
    // Emoticons (U+1F600–1F64F)
    (codePoint >= 0x1f600 && codePoint <= 0x1f64f) ||
    // Transport and map symbols (U+1F680–1F6FF)
    (codePoint >= 0x1f680 && codePoint <= 0x1f6ff) ||
    // Supplemental Symbols and Pictographs (U+1F900–1F9FF)
    (codePoint >= 0x1f900 && codePoint <= 0x1f9ff) ||
    // Symbols and Pictographs Extended-A (U+1FA70–1FAFF)
    (codePoint >= 0x1fa70 && codePoint <= 0x1faff)
  );
};

/**
 * Extracts all emojis from a string
 */
export const extractEmojis = (text?: string): string[] => {
  if (!text) return [];

  const result: string[] = [];

  // First try with emoji-regex
  const emojiRe = emojiRegex();
  let match;
  while ((match = emojiRe.exec(text)) !== null) {
    result.push(match[0]);
  }

  // Then check for any we might have missed using code point analysis
  // Split the text into grapheme clusters (visible characters)
  const chars = Array.from(text);
  for (const char of chars) {
    // Skip if it's already matched by emoji-regex
    if (result.includes(char)) continue;

    // Check if it's an emoji by code point
    if (isEmojiChar(char) && !result.includes(char)) {
      result.push(char);
    }
  }

  return result;
};

export const isOnlyEmojis = (text?: string) => {
  if (!text) return false;

  // Extract all emojis
  const emojis = extractEmojis(text);

  // Remove emojis and whitespace
  let remaining = text;
  for (const emoji of emojis) {
    remaining = remaining.replace(emoji, '');
  }

  // Check if anything other than whitespace remains
  remaining = remaining.replace(/[\s\n]/gm, '');
  return remaining.length === 0;
};

export const isOnlyEmojisCount = (text?: string) => {
  if (!text) return 0;

  if (!isOnlyEmojis(text)) return 0;

  return extractEmojis(text).length;
};

export const isSingleEmoji = (text?: string) => {
  if (!text) return false;

  // Check if only contains emojis (and possibly whitespace)
  if (!isOnlyEmojis(text)) return false;

  // Count emojis
  return extractEmojis(text).length === 1;
};

export const isMessageEdited = (message?: ChatMessageMessage) => !!message?.updated_at;
