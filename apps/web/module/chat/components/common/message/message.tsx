import React, { useCallback } from 'react';

import { RoomEventDiscriminator } from 'module/chat/model/types';

import { useChannelMemberPreviewContext } from '../../../context/channel-member-preview-context';
import { useChannelMemberById } from '../channel/hooks/use-channel-member';
import {
  MessageContextValue,
  MessageProvider,
  useChannelActionContext,
  useChannelStateContext,
} from './../../../context';
import { useRetryHandler } from './hooks/use-retry-handler';
import {
  useActionHandler,
  useDeleteHandler,
  useEditHandler,
  useUserHandler,
  useUserRole,
} from './hooks';
import { MessageUi } from './message-ui';
import type { MessageProps } from './types';
import { areMessagePropsEqual, getMessageActions, MESSAGE_ACTIONS } from './utils';

type MessagePropsToOmit = 'onMentionsClick' | 'onMentionsHover' | 'openThread' | 'retrySendMessage';

type MessageContextPropsToPick = 'handleAction' | 'handleDelete' | 'handleRetry';

type MessageWithContextProps = Omit<MessageProps, MessagePropsToOmit> &
  Pick<MessageContextValue, MessageContextPropsToPick> & {
    userRoles: ReturnType<typeof useUserRole>;
  };

const MessageWithContext = (props: MessageWithContextProps) => {
  const {
    groupedByUser = true,
    message,
    messageActions = Object.keys(MESSAGE_ACTIONS),
    onUserClick: propOnUserClick,
    onUserHover: propOnUserHover,
    userRoles,
  } = props;

  const actionsEnabled =
    message.discriminator === RoomEventDiscriminator.MESSAGE && message.status !== 'sending';
  const isSending = message.status === 'sending';

  const { clearEdit, editing, setEdit } = useEditHandler();
  const openPreviewMemberDialog = useChannelMemberPreviewContext((v) => v.openDialog);

  const { onUserClick, onUserHover } = useUserHandler(props.user, {
    onUserClickHandler: (event, user) => {
      openPreviewMemberDialog(user);
      propOnUserClick?.(event, user);
    },
    onUserHoverHandler: propOnUserHover,
  });

  const { canDelete, canEdit, canReply, canForward, isMyMessage } = userRoles;

  const messageActionsHandler = useCallback(
    () =>
      getMessageActions(messageActions, {
        canDelete,
        canEdit,
        canReply,
        canForward,
      }),
    [messageActions, canDelete, canEdit, canReply]
  );

  const {
    messageActions: messageActionsPropToNotPass,
    onlySenderCanEdit: onlySenderCanEditPropToNotPass,
    onUserClick: onUserClickPropToNotPass,
    onUserHover: onUserHoverPropToNotPass,
    userRoles: userRolesPropToNotPass,
    ...rest
  } = props;

  const messageContextValue: MessageContextValue = {
    ...rest,
    actionsEnabled,
    clearEditingState: clearEdit,
    handleEdit: setEdit,
    editing,
    getMessageActions: messageActionsHandler,
    isMyMessage: () => isMyMessage,
    messageIsUnread: false,
    onUserClick,
    onUserHover,
    setEditingState: setEdit,
  };

  return (
    <MessageProvider value={messageContextValue}>
      <MessageUi sending={isSending} groupedByUser={groupedByUser} />
    </MessageProvider>
  );
};

const MemoizedMessage = React.memo(
  MessageWithContext,
  areMessagePropsEqual
) as typeof MessageWithContext;

export const Message = (props: MessageProps) => {
  const { message, onlySenderCanEdit = false, retrySendMessage: propRetrySendMessage } = props;

  const { addNotification } = useChannelActionContext('Message');
  const { highlightedMessageUuid } = useChannelStateContext('Message');

  const handleAction = useActionHandler(message);
  const handleRetry = useRetryHandler(propRetrySendMessage);

  const user = useChannelMemberById(message.user_id);

  const userRoles = useUserRole(user, onlySenderCanEdit);

  const handleDelete = useDeleteHandler(message, {
    getErrorNotification: () => 'Ошибка при удалении сообщения',
    notify: addNotification,
  });

  const highlighted = highlightedMessageUuid === message.uuid;

  return (
    <MemoizedMessage
      autoscrollToBottom={props.autoscrollToBottom}
      endOfGroup={props.endOfGroup}
      firstOfGroup={props.firstOfGroup}
      groupedByUser={props.groupedByUser}
      groupStyles={props.groupStyles}
      handleAction={handleAction}
      handleDelete={handleDelete}
      handleRetry={handleRetry}
      highlighted={highlighted}
      lastReceivedId={props.lastReceivedId}
      message={message}
      messageActions={props.messageActions}
      messageListRect={props.messageListRect}
      onUserClick={props.onUserClick}
      onUserHover={props.onUserHover}
      user={user}
      userRoles={userRoles}
    />
  );
};
