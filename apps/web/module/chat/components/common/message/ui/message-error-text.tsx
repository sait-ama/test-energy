import React from 'react';

import { ChatMessage } from '../../../../context/channel-state-context';

export interface MessageErrorTextProps {
  message: ChatMessage;
}

export function MessageErrorText({ message }: MessageErrorTextProps) {
  if (message.type === 'error') {
    return <div className="">"Ошибка · сообщение не отправлено"</div>;
  }

  if (message.status === 'failed') {
    return (
      <div className="text-xs text-red-500">
        {message.error?.code !== 403 ? 'Ошибка · Попробуйте снова' : 'Ошибка · Неавторизован'}
      </div>
    );
  }

  return null;
}
