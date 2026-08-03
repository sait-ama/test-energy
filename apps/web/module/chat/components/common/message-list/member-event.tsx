import React, { useMemo } from 'react';

import { useChannelMemberPreviewContext } from '../../../context/channel-member-preview-context';
import { RoomEventDiscriminator, RoomMemberEventMessage } from '../../../model/types';
import { useChannelMemberById } from '../channel/hooks/use-channel-member';

export type DateSeparatorProps = {
  message: RoomMemberEventMessage;
};

const UnMemoizedMemberEvent = (props: DateSeparatorProps) => {
  const { message } = props;
  const user = useChannelMemberById(message.user_id!);
  const openUserPreviewDialog = useChannelMemberPreviewContext((v) => v.openDialog);

  const text = useMemo(() => {
    if (!user) {
      return null;
    }

    if (message.discriminator === RoomEventDiscriminator.MEMBER_JOIN) {
      return (
        <>
          <span
            className="hover:text-primary transition-color cursor-pointer duration-150"
            onClick={() => openUserPreviewDialog(user)}
          >
            {user.username}
          </span>{' '}
          присоединился к чату
        </>
      );
    }

    if (message.discriminator === RoomEventDiscriminator.MEMBER_LEAVE) {
      return (
        <>
          <span
            className="hover:text-primary transition-color cursor-pointer duration-150"
            onClick={() => openUserPreviewDialog(user)}
          >
            {user.username}
          </span>{' '}
          покинул чат
        </>
      );
    }

    return '';
  }, [message.uuid]);

  if (!user || !text) {
    return <div style={{ height: '1px' }}></div>;
  }

  return (
    <div className="flex w-full justify-center py-2" data-testid="member-event-message">
      <div className="text-muted-foreground text-xs">{text}</div>
    </div>
  );
};

export const MemberEvent = React.memo(UnMemoizedMemberEvent) as typeof UnMemoizedMemberEvent;
