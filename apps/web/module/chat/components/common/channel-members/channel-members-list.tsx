import { PropsWithChildren } from 'react';
import Link from 'next/link';

import { ChannelMemberSchema, RoleChatUser } from 'module/chat/model/types';

import { cn } from '@re/ui-kit/utils/cn';

import { Routing } from '~shared/config/routing';

import {
  ChannelMemberPreviewProvider,
  useChannelMemberPreviewContext,
} from '../../../context/channel-member-preview-context';
import { Avatar } from '../../ui/avatar';
import { chatMemberRoleToText } from '../user-item/utils';

export const ChannelMembersListContainer = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <ChannelMemberPreviewProvider>
      <div className={cn('flex flex-col gap-4 p-4', className)}>{children}</div>
    </ChannelMemberPreviewProvider>
  );
};

type ChannelMemberListItemProps = {
  member: ChannelMemberSchema;
  className?: string;
  onClick?: (member: ChannelMemberSchema) => void;
};

const ChannelMemberListItem = ({ member, className, onClick }: ChannelMemberListItemProps) => (
  <div
    className={cn('group flex w-full cursor-pointer items-center gap-4', className)}
    onClick={() => onClick?.(member)}
  >
    <Avatar image={member.avatar?.mid} className="size-10" username={member.username} />
    <div className="w-full gap-4">
      <div className="text-sm font-semibold group-hover:underline">{member.username}</div>
      {member?.role !== RoleChatUser.MEMBER && (
        <p className="text-muted-foreground text-xs">{chatMemberRoleToText(member.role)}</p>
      )}
    </div>
  </div>
);

const ChannelMemberItemLink = ({ member, className }: ChannelMemberListItemProps) => {
  return (
    <Link
      href={Routing.User.detail({ params: { id: member.id } })}
      className={cn('w-full', className)}
    >
      <ChannelMemberListItem member={member} />
    </Link>
  );
};

const ChannelMemberItemPreview = (props: ChannelMemberListItemProps) => {
  const openDialog = useChannelMemberPreviewContext((v) => v.openDialog);

  const handleClick = (member: ChannelMemberSchema) => {
    if (props.onClick) {
      props.onClick(member);
    }

    openDialog(member);
  };

  return <ChannelMemberListItem {...props} onClick={handleClick} />;
};

type ChannelMembersListProps = {
  members?: ChannelMemberSchema[];
  behavior?: 'link' | 'preview';
  itemProps?: Omit<ChannelMemberListItemProps, 'member'>;
};

export const ChannelMembersList = ({ members, behavior = 'link' }: ChannelMembersListProps) => {
  function renderMember(member: ChannelMemberSchema) {
    if (behavior === 'link') {
      return <ChannelMemberItemLink key={member.id} member={member} />;
    }

    if (behavior === 'preview') {
      return <ChannelMemberItemPreview key={member.id} member={member} />;
    }
  }

  return members?.map(renderMember);
};
