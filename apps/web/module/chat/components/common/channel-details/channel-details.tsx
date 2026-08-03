import { CSSProperties, FC, PropsWithChildren, RefAttributes } from 'react';

import { useChannelStateContext } from 'module/chat/context/channel-state-context';
import { ChannelType } from 'module/chat/model/types';

import { cn } from '@re/ui-kit/utils/cn';

import { Avatar, AvatarProps } from '../../ui/avatar';
import { getAttachmentUrl } from '../attachment';

export type ChannelDetailsRootProps = PropsWithChildren<{
  ref?: RefAttributes<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
}>;

export const ChannelDetailsRoot: FC<ChannelDetailsRootProps> = ({
  children,
  ref,
  className,
  style,
}) => {
  return (
    <div
      className={cn('bg-background flex size-full items-center gap-2', className)}
      style={style}
      ref={ref}
    >
      {children}
    </div>
  );
};

export type ChannelDetailsAvatarProps = Omit<AvatarProps, 'image'>;

export const ChannelDetailsAvatar: FC<ChannelDetailsAvatarProps> = (props) => {
  const { channel } = useChannelStateContext();
  return (
    <Avatar
      variant="square"
      {...props}
      className={cn('size-24', props.className)}
      image={getAttachmentUrl(channel.cover, 'thumbnail')}
    />
  );
};

export type ChannelDetailsNameProps = {
  className?: string;
};

export const ChannelDetailsName = (props: ChannelDetailsNameProps) => {
  const { channel } = useChannelStateContext();
  return <div className={cn('text-2xl font-bold', props.className)}>{channel.name}</div>;
};

export type ChannelDetailsDescriptionProps = {
  className?: string;
};

export const ChannelDetailsDescription = (props: ChannelDetailsDescriptionProps) => {
  const { channel } = useChannelStateContext();

  if (channel.type === ChannelType.GROUP) {
    return (
      <div className={cn('text-muted-foreground text-sm', props.className)}>
        {channel.members?.filter((member) => !member.is_deleted).length} участник(ов)
      </div>
    );
  }

  return null;
};
