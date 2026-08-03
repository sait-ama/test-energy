import { ItemProps, ListItem } from 'react-virtuoso';

import throttle from 'lodash.throttle';
import { RoomEventDiscriminator } from 'module/chat/model/types';

import { cn } from '@re/ui-kit/utils/cn';

import { ChatMessage, ChatMessageMessage } from '../../../context';
import type { UnknownType } from '../../../types/types';
import { LoadingIndicator } from '../../ui/loading-indicator';
import { EmptyStateIndicator } from '../empty-state-indicator';
import { Message } from '../message';
import { isMessageEdited } from '../message/utils';
import { DateSeparator } from './date-separator';
import { MemberEvent } from './member-event';
import { GroupStyle, isRoomMemberEventMessage } from './utils';
import { isDateSeparatorMessage } from './utils';
import type { VirtuosoContext } from './virtualized-message-list';

const PREPEND_OFFSET = 10 ** 7;

export function calculateItemIndex(virtuosoIndex: number, numItemsPrepended: number) {
  return virtuosoIndex + numItemsPrepended - PREPEND_OFFSET;
}

export function calculateFirstItemIndex(numItemsPrepended: number) {
  return PREPEND_OFFSET - numItemsPrepended;
}

export const makeItemsRenderedHandler = (
  renderedItemsActions: Array<(msg: ChatMessage[]) => void>,
  processedMessages: ChatMessage[]
) =>
  throttle((items: ListItem<UnknownType>[]) => {
    const renderedMessages = items
      .map((item) => {
        if (!item.originalIndex) return undefined;
        return processedMessages[calculateItemIndex(item.originalIndex, PREPEND_OFFSET)];
      })
      .filter((msg) => !!msg);
    renderedItemsActions.forEach((action) => action(renderedMessages as ChatMessage[]));
  }, 200);

type CommonVirtuosoComponentProps = {
  context?: VirtuosoContext;
};

// using 'display: inline-block'
// traps CSS margins of the item elements, preventing incorrect item measurements
export const Item = ({
  context,
  ...props
}: ItemProps<ChatMessage> & CommonVirtuosoComponentProps) => {
  if (!context) return <></>;

  const message =
    context.processedMessages[
      calculateItemIndex(props['data-item-index'], context.numItemsPrepended)
    ];

  const groupStyles: GroupStyle = context.messageGroupStyles[message?.uuid];

  return (
    <div
      {...props}
      className={cn('', {
        [`${groupStyles}`]: groupStyles,
      })}
    />
  );
};

export const Header = ({ context }: CommonVirtuosoComponentProps) => {
  return (
    <div className="flex h-8 items-center justify-center p-2">
      {context?.loadingMore && <LoadingIndicator className="h-4 w-4" />}
    </div>
  );
};

export const EmptyPlaceholder = ({ context }: CommonVirtuosoComponentProps) => {
  return <EmptyStateIndicator listType="message" />;
};

export const messageRenderer = (
  virtuosoIndex: number,
  _data: UnknownType,
  virtuosoContext: VirtuosoContext
) => {
  const {
    messageActions,
    messageGroupStyles,
    numItemsPrepended,
    processedMessages: messageList,
    shouldGroupByUser,
    virtuosoRef,
  } = virtuosoContext;

  const messageIndex = calculateItemIndex(virtuosoIndex, numItemsPrepended);

  const message = messageList[messageIndex];

  if (!message) {
    return <div style={{ height: '1px' }}></div>; // returning null o r zero height breaks the virtuoso
  }

  if (isDateSeparatorMessage(message)) {
    return <DateSeparator date={message.date} />;
  }

  if (isRoomMemberEventMessage(message)) {
    return <MemberEvent message={message} />;
  }

  if (message.discriminator !== RoomEventDiscriminator.MESSAGE) {
    return <div style={{ height: '1px' }}></div>; // returning null o r zero height breaks the virtuoso
  }

  const groupedByUser =
    shouldGroupByUser &&
    message.user_id &&
    ((messageIndex > 0 && message.user_id === messageList[messageIndex - 1]!.user_id) ||
      (messageIndex < messageList.length - 1 &&
        message.user_id === messageList[messageIndex + 1]!.user_id));

  const maybePrevMessage: ChatMessage | undefined = messageList[messageIndex - 1];
  const maybeNextMessage: ChatMessage | undefined = messageList[messageIndex + 1];

  const firstOfGroup =
    shouldGroupByUser &&
    message.user_id &&
    (message.user_id !== maybePrevMessage?.user_id ||
      (maybePrevMessage && isMessageEdited(maybePrevMessage as ChatMessageMessage)));

  const endOfGroup =
    shouldGroupByUser &&
    message.user_id &&
    (message.user_id !== maybeNextMessage?.user_id ||
      (maybeNextMessage && isMessageEdited(maybeNextMessage as ChatMessageMessage)));

  return (
    <Message
      autoscrollToBottom={virtuosoRef.current?.autoscrollToBottom}
      firstOfGroup={!!firstOfGroup}
      endOfGroup={!!endOfGroup}
      groupedByUser={!!groupedByUser}
      groupStyles={[messageGroupStyles[message.uuid] ?? '']}
      message={message}
      messageActions={messageActions}
    />
  );
};
