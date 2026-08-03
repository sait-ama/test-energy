import { useMemo } from 'react';
import { useFormatter, useNow } from 'next-intl';

import { getClientDate } from '~shared/utils/get-client-date';

import { ChannelSchema } from '../../../model/types';
import { ChannelPreviewUI } from './channel-preview-ui';
import { channelToSubtitle } from './utils';

type OwnProps = {
  channel: ChannelSchema;
  onChannelSelect: (channel: ChannelSchema) => void;
  isActive?: boolean;
  className?: string;
};

const channelTypeToSubtitle = (type: ChannelSchema['type']) => {
  switch (type) {
    case 'private':
      return 'Личный чат';
    case 'group':
      return 'Групповой чат';
    default:
      return '';
  }
};

const ChannelPreview = (props: OwnProps) => {
  const { channel, isActive, onChannelSelect } = props;
  const formatter = useFormatter();
  const now = useNow({
    updateInterval: 30000,
  });

  const subtitle = useMemo(() => {
    return channelToSubtitle(channel);
    // return getLatestMessagePreview(channel.last_message);
  }, []);

  const messageTimestamp = useMemo(() => {
    if (!channel.last_update_dt) return '';

    const clientDate = getClientDate({ serverDateString: channel.last_update_dt });

    const realNow = new Date();

    return formatter.relativeTime(clientDate!, realNow);
  }, [channel.last_update_dt, now]);

  const unread = channel.last_update_dt
    ? channel.last_read_dt && new Date(channel.last_update_dt) > new Date(channel.last_read_dt)
    : false;
  const isPinned = false;

  return (
    <ChannelPreviewUI
      href={`#${channel.id}`}
      isActive={isActive}
      channel={channel}
      onChannelSelect={() => onChannelSelect(channel)}
      subtitle={subtitle}
      messageTimestamp={messageTimestamp}
      unread={unread}
      isPinned={isPinned}
    />
  );
};

export { ChannelPreview };
