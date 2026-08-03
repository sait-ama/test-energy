import React from 'react';

import { useMessageContext } from '../../../../context';
import { LoadingIndicator } from '../../../ui/loading-indicator';
import { MessageDeliveredIcon } from '../icons';

export type MessageStatusProps = {};

const UnMemoizedMessageStatus = (props: MessageStatusProps) => {
  const { isMyMessage, message } = useMessageContext('MessageStatus');

  if (!isMyMessage() || message.type === 'error') return null;

  const rootClassName = ``;

  const sending = message.status === 'sending';
  const delivered = message.status === 'received';

  return (
    <span className={rootClassName}>
      {sending && <LoadingIndicator className="size-2" />}
      {delivered && <MessageDeliveredIcon />}
    </span>
  );
};

export const MessageStatus = React.memo(UnMemoizedMessageStatus) as typeof UnMemoizedMessageStatus;
