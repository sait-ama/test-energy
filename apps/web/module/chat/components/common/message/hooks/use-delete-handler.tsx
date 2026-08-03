import { ChatMessage } from '../../../../context';
import { useChannelActionContext } from '../../../../context/channel-actions-context';
import { useChatContext } from '../../../../context/chat-context';
import type { ReactEventHandler } from '../types';
import { validateAndGetMessage } from '../utils';

export type DeleteMessageNotifications = {
  getErrorNotification?: (message: ChatMessage) => string;
  notify?: (notificationText: string, type: 'success' | 'error') => void;
};

export const useDeleteHandler = (
  message?: ChatMessage,
  notifications: DeleteMessageNotifications = {}
): ReactEventHandler => {
  const { getErrorNotification, notify } = notifications;

  const { deleteMessage, updateMessage } = useChannelActionContext('useDeleteHandler');
  const { client } = useChatContext('useDeleteHandler');

  return async (event) => {
    event.preventDefault();
    if (!message?.id || !client || !updateMessage) {
      return;
    }

    try {
      const deletedMessage = await deleteMessage(message);
      updateMessage(deletedMessage);
    } catch {
      const errorMessage =
        getErrorNotification && validateAndGetMessage(getErrorNotification, [message]);

      if (notify) notify(errorMessage || 'Ошибка при удалении сообщения', 'error');
    }
  };
};
