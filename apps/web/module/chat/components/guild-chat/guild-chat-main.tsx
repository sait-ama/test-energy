import { memo } from 'react';

import { ClubDetail } from '@re/api/generated/types.gen';

import { Chat } from '../common/chat/chat';
import { MiddleColumn } from './middle/middle-column';

export type GuildChatMainProps = {
  club: ClubDetail;
};

const GuildChatMain = memo(({ club }: GuildChatMainProps) => {
  return (
    <Chat initialDir={club.dir}>
      <MiddleColumn club={club} />
    </Chat>
  );
});

export { GuildChatMain };
