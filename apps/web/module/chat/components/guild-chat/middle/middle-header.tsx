import { memo } from 'react';

import { useChannelStateContext } from 'module/chat/context';
import { ChannelType } from 'module/chat/model/types';

import { cn } from '@re/ui-kit/utils/cn';

import { ClubDetailSchema } from '~shared/api/models/guild-club';
import { Wallpaper, WallpaperBackground } from '~shared/ui/wallpaper';

import { getAttachmentUrl } from '../../common/attachment';
import { Avatar } from '../../ui/avatar';

const MiddleHeader = memo(({ club }: { club: ClubDetailSchema }) => {
  const { channel } = useChannelStateContext('MiddleHeader');

  const renderStatus = () => {
    if (!channel) {
      return '';
    }
    if (channel?.type === ChannelType.GROUP) {
      return channel.members?.length + ' участник(ов)';
    }

    return '';
  };

  return (
    <div className="max-md:bg-background/10 relative flex h-[60px] w-full flex-row items-center gap-2 border-b px-2 max-md:backdrop-blur-xs md:h-[70px] md:px-4">
      <WallpaperBackground className="z-10 h-full w-full">
        <Wallpaper
          withMask={false}
          src={club.wallpaper?.high}
          className="object-cover object-center"
        />
      </WallpaperBackground>

      <div className="z-10 flex w-full flex-row items-center gap-3">
        <Avatar
          variant="square"
          className="size-10 md:size-12"
          image={getAttachmentUrl(channel?.cover, 'thumbnail', club.avatar?.mid)}
          username={channel?.name ?? club.name}
        />
        <div className="flex flex-col">
          <div className="text-md font-bold">
            <span
              className={cn(club.wallpaper?.high && 'text-white')}
              style={club.wallpaper?.high ? { textShadow: '#000 1px 0 10px' } : {}}
            >
              {channel?.name ?? club.name}
            </span>
          </div>
          <div className="text-muted-foreground text-xs">{renderStatus()}</div>
        </div>
      </div>
    </div>
  );
});

export { MiddleHeader };
