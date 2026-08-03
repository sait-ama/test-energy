import Link from 'next/link';

import { toast } from 'sonner';

import { Button, buttonVariants } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import { UserAvatar } from '~entities/user/ui/user-avatar';
import { Routing } from '~shared/config/routing';

import { useChannelStateContext, useChatContext } from '../../../context';
import { useChannelMemberPreviewContext } from '../../../context/channel-member-preview-context';
import { useRemoveChannelMemberMutation } from '../../../model/toolkit/mutations';
import { ChannelType, RoleChatUser } from '../../../model/types';
import { chatMemberRoleToText } from '../user-item/utils';

type ChannelMemberPreviewDialogContentProps = {
  className?: string;
};

export const ChannelMemberPreviewDialogContent = (
  props: ChannelMemberPreviewDialogContentProps
) => {
  const member = useChannelMemberPreviewContext((v) => v.member)!;
  const channelCapabilities = useChannelStateContext((v) => v.channelCapabilities);
  const channel = useChannelStateContext((v) => v.channel);
  const { user } = useChatContext();
  const onClose = useChannelMemberPreviewContext((v) => v.closeDialog);

  const canManageMembers = channel.type === ChannelType.GROUP && channelCapabilities?.manageMembers;
  const isMe = user?.id === member?.id;
  const isOwner = member?.role === RoleChatUser.CREATOR;

  const isCanRemove = canManageMembers && !isMe && !isOwner;

  const { mutate: removeChannelMember, isPending } = useRemoveChannelMemberMutation(channel.id, {
    onSuccess: () => {
      toast.success('Участник удален');
      onClose();
    },
    onError: (error) => {
      toast.error('Не удалось удалить участника');
    },
  });

  const handleRemoveChannelMember = () => {
    removeChannelMember({ user_ids: [member.id], role: member.role });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <UserAvatar
          alt={member?.username ?? ''}
          avatarSrc={member?.avatar?.mid}
          frameSrc={member?.frame?.high}
          size={64}
        />
        <div className="flex flex-col gap-2">
          <DialogTitle>{member?.username}</DialogTitle>
          <DialogDescription>{chatMemberRoleToText(member?.role)}</DialogDescription>
        </div>
      </div>
      <Link
        href={Routing.User.detail({ params: { id: member?.id! } })}
        className={cn('w-full', buttonVariants({ color: 'secondary' }))}
      >
        На страницу профиля
      </Link>
      {isCanRemove && (
        <Button color="danger" disabled={isPending} onClick={handleRemoveChannelMember}>
          {isPending ? '...' : 'Удалить участника'}
        </Button>
      )}
    </div>
  );
};

type ChannelMemberPreviewDialogProps = {
  className?: string;
  children: React.ReactNode;
};

export const ChannelMemberPreviewDialog = (props: ChannelMemberPreviewDialogProps) => {
  const { className, children } = props;
  const isOpen = useChannelMemberPreviewContext((v) => v.isOpen);
  const onClose = useChannelMemberPreviewContext((v) => v.closeDialog);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">{children}</DialogContent>
    </Dialog>
  );
};
