import React from 'react';

import { ChannelMemberSchema } from 'module/chat/model/types';

import { cn } from '@re/ui-kit/utils/cn';

import { CUSTOM_MESSAGE_TYPE } from '../../../constants/messageTypes';
import { MessageContextValue, useMessageContext } from '../../../context';
import { Avatar } from '../../ui/avatar';
import { LoadingIndicator } from '../../ui/loading-indicator';
import { Attachment } from '../attachment/attachment';
import { MessageText } from './ui/message-text';
import { Timestamp } from './ui/timestamp';
import { MessageDeliveredIcon } from './icons';
import type { MessageUIComponentProps } from './types';
import { areMessageUIPropsEqual, isOnlyEmojisCount, messageHasAttachments } from './utils';

type MessageSimpleWithContextProps = MessageContextValue & {
  user?: ChannelMemberSchema;
};

const MessageUiWithContext = (props: MessageSimpleWithContextProps) => {
  const {
    sending,
    endOfGroup,
    firstOfGroup,
    groupedByUser,
    handleRetry,
    highlighted,
    isMyMessage,
    message,
    onUserClick,
    onUserHover,
    user,
  } = props;

  const hasAttachment = messageHasAttachments(message);
  const onlyEmojisCount = isOnlyEmojisCount(message?.text);

  if (message.customType === CUSTOM_MESSAGE_TYPE.date) {
    return null;
  }

  const showMetadata = !groupedByUser || endOfGroup;
  const allowRetry = message.status === 'failed' && message.errorStatusCode !== 403;

  let handleClick: (() => void) | undefined = undefined;

  if (allowRetry) {
    handleClick = () => handleRetry(message);
  }

  const isMy = isMyMessage();

  const showUsername = !isMy && firstOfGroup;

  const rootClassName = cn(
    'flex flex-row gap-1 pb-4 px-2 md:px-3',
    isMy ? 'justify-end' : 'justify-start',
    message?.text ? 'has-text' : 'no-text',
    {
      'message--has-attachment': hasAttachment,
      'message--highlighted': highlighted,
      'message-send-can-be-retried':
        message?.status === 'failed' && message?.errorStatusCode !== 403,
      'pb-2!': endOfGroup,
      '': firstOfGroup,
      'pb-0.5': groupedByUser,
    }
  );

  const bubbleClassName = cn('rounded-md p-0.5', {
    'bg-white dark:bg-card border-1 pl-3 pr-3.5 py-2.5': onlyEmojisCount === 0 || hasAttachment,
    'bg-white dark:bg-[#212328]': isMy && (onlyEmojisCount === 0 || hasAttachment),
    'ml-auto': isMy,
    '': hasAttachment,
    'message--highlighted': highlighted,
    'message-send-can-be-retried': message?.status === 'failed' && message?.errorStatusCode !== 403,
    // 'rounded-l-[4px]': groupedByUser && !isMy,
    // 'rounded-r-[4px]': groupedByUser && isMy,
    'rounded-t-md': firstOfGroup && !isMy,
    '': endOfGroup,
    'border-transparent transition-colors duration-200 hover:border-primary': allowRetry,
    'pt-1.5': showUsername,
  });

  const showAvatar = !groupedByUser || endOfGroup;

  const renderAvatar = (className?: string) => {
    if (!user) {
      return null;
    }

    if (showAvatar) {
      return (
        <Avatar
          className={cn('mt-auto size-10 min-w-10', !!onUserClick && 'cursor-pointer', className)}
          image={user.avatar?.mid}
          username={user.username}
          onClick={onUserClick}
          onMouseOver={onUserHover}
        />
      );
    }

    return <span className={cn('aspect-square h-10 w-10', className)} />;
  };

  return (
    <div className={rootClassName} key={message.uuid}>
      {!isMy && renderAvatar()}
      <div
        className={cn('flex flex-col', {})}
        style={isMy ? { marginInlineStart: 78 } : { marginInlineEnd: 78 }}
        data-testid="message-inner"
        onClick={handleClick}
        onKeyUp={handleClick}
      >
        <div className={bubbleClassName}>
          {showUsername && <div className="text-muted-foreground text-xs">{user?.username}</div>}
          {hasAttachment ? <Attachment attachments={message.attachments!} /> : null}
          <MessageText message={message} hasAttachment={hasAttachment} />
        </div>
        <div
          className={cn('mt-1 flex flex-row gap-2 px-1', isMy ? 'justify-end' : 'justify-start')}
        >
          {showMetadata && (
            <>
              <Timestamp className="text-xs" timestamp={message.created_at} />
              {isMy && !sending && (
                <MessageDeliveredIcon className="text-primary fill-background size-4" />
              )}
            </>
          )}
          {sending && <LoadingIndicator className="m-0.5 size-3" />}
        </div>
      </div>
      {isMy && renderAvatar('max-md:hidden')}
    </div>
  );
};

const MemoizedMessageUi = React.memo(
  MessageUiWithContext,
  areMessageUIPropsEqual
) as typeof MessageUiWithContext;

export const MessageUi = (props: MessageUIComponentProps) => {
  const messageContext = useMessageContext('MessageSimple');

  return <MemoizedMessageUi {...messageContext} {...props} />;
};
