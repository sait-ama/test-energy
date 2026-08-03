import { memo, ReactNode } from 'react';
import Link from 'next/link';

import Pin from '@re/ui-kit/icons/pin';
import { cn } from '@re/ui-kit/utils/cn';

import { ChannelSchema } from '../../../model/types';
import { Avatar } from '../../ui/avatar';
import { getAttachmentUrl } from '../attachment/utils';

// TODO: add some DI
type ChannelPreviewUIProps = {
  isActive?: boolean;
  subtitle: ReactNode | string;
  messageTimestamp?: string;
  unread: boolean;
  onChannelSelect: () => void;
  isPinned: boolean;
  href: string;
  channel: ChannelSchema;
};

const ChannelPreviewUI = memo((props: ChannelPreviewUIProps) => {
  const { isActive, subtitle, messageTimestamp, unread, isPinned, onChannelSelect, href, channel } =
    props;

  return (
    <Link
      prefetch={false}
      href={href}
      onClick={onChannelSelect}
      className={cn(
        'bg-card mb-1 flex items-center gap-3 rounded-xl border border-transparent p-1.5 pr-2.5 transition-colors duration-200',
        {
          // 'border-[#3C3D41] bg-[#212328]': isActive,
          'bg-primary dark:bg-accent text-white': isActive,
          'hover:bg-card/50': !isActive,
        }
      )}
    >
      <Avatar
        variant="square"
        username={channel.name}
        className="size-[54px] flex-shrink-0"
        image={getAttachmentUrl(channel.cover)}
      />
      <div className="flex w-full min-w-0 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="text-md overflow-hidden font-semibold text-ellipsis whitespace-nowrap">
            {channel.name}
          </div>
          {unread ? (
            <div className="bg-primary ml-auto size-1.5 flex-shrink-0 rounded-md text-xs text-white" />
          ) : isPinned ? (
            <div className="ml-auto flex-shrink-0 text-xs dark:text-[#A6A7A8]">
              <Pin size={14} />
            </div>
          ) : null}
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="overflow-hidden text-xs text-ellipsis whitespace-nowrap dark:text-[#A6A7A8]">
            {subtitle}
          </div>
          <div className="ml-auto flex-shrink-0 text-xs dark:text-[#A6A7A8]">
            {messageTimestamp}
          </div>
        </div>
      </div>
    </Link>
  );
});
ChannelPreviewUI.displayName = 'ChannelPreviewUI';

export { ChannelPreviewUI };
