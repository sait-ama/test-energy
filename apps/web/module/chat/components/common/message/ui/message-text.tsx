import React, { useMemo } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { useMessageContext } from '../../../../context';
import type { ChatMessageMessage } from '../../../../context/channel-state-context';
import { renderText } from './../renderText';
import { isOnlyEmojisCount } from './../utils';
import { MessageErrorText } from './message-error-text';

export type MessageTextProps = {
  customInnerClass?: string;
  customWrapperClass?: string;
  message?: ChatMessageMessage;
  skipPurge?: boolean;
  returnPureText?: boolean;
  hasAttachment?: boolean;
};

const UnMemoizedMessageTextComponent = (props: MessageTextProps) => {
  const {
    customInnerClass,
    customWrapperClass = '',
    message: propMessage,
    skipPurge = false,
    hasAttachment = false,
    returnPureText = true,
  } = props;
  const { message: contextMessage } = useMessageContext('MessageText');

  const message = propMessage || contextMessage;

  const onlyEmojisCount = isOnlyEmojisCount(message.text);

  const messageText = useMemo(
    () => renderText(message.text, undefined, { skipPurge, returnPureText }),

    [message, skipPurge, returnPureText]
  );

  const wrapperClass = cn('', customWrapperClass);
  const innerClass = cn('text-sm [overflow-wrap:anywhere]', customInnerClass);

  return (
    <div className={wrapperClass} tabIndex={0}>
      <div
        className={cn(innerClass, {
          'mt-2': hasAttachment,
          'text-6xl': onlyEmojisCount === 1,
          'text-3xl': onlyEmojisCount > 1 && onlyEmojisCount <= 3,
        })}
      >
        <MessageErrorText message={message} />
        <div className="">{messageText}</div>
      </div>
    </div>
  );
};

export const MessageText = React.memo(
  UnMemoizedMessageTextComponent
) as typeof UnMemoizedMessageTextComponent;
