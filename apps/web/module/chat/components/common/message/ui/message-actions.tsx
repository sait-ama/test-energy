import React from 'react';

import type { MessageContextValue } from '../../../../context';
import { useMessageContext } from '../../../../context';

export type MessageOptionsProps = Partial<MessageContextValue> & {};

const UnMemoizedMessageOptions = (props: MessageOptionsProps) => {
  const {} = props;

  const { getMessageActions, initialMessage, message } = useMessageContext('MessageOptions');

  const messageActions = getMessageActions();

  if (
    !message.type ||
    message.type === 'error' ||
    message.type === 'system' ||
    message.status === 'failed' ||
    message.status === 'sending' ||
    initialMessage
  ) {
    return null;
  }

  return null;
};

export const MessageOptions = React.memo(
  UnMemoizedMessageOptions
) as typeof UnMemoizedMessageOptions;
