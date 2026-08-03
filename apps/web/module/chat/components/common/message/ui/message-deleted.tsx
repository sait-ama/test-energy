import React from 'react';

import { ChatMessage } from '../../../../context';
import { useUserRole } from '../hooks';

export type MessageDeletedProps = {
  message: ChatMessage;
};

export const MessageDeleted = (props: MessageDeletedProps) => {
  const { message } = props;

  const { isMyMessage } = useUserRole(message);

  const messageClasses = isMyMessage ? '' : '';

  return (
    <div className={`${messageClasses} ${message.type} `} key={message.id}>
      <div className="">Сообщение было удалено</div>
    </div>
  );
};
