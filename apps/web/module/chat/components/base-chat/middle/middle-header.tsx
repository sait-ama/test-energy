import { PropsWithChildren, useState } from 'react';

import { useChannelStateContext } from 'module/chat/context';
import {
  useDeleteChannelMutation,
  useLeaveChannelMutation,
  useUpdateChannelMutation,
} from 'module/chat/model/toolkit/mutations';
import { ChannelSchema, ChannelType } from 'module/chat/model/types';
import { toast } from 'sonner';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import DotsVertical from '@re/ui-kit/icons/dots-vertical';
import LeaveIcon from '@re/ui-kit/icons/leave';
import Search from '@re/ui-kit/icons/search';
import SettingsIcon from '@re/ui-kit/icons/settings';
import TrashIcon from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@re/ui-kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { cn } from '@re/ui-kit/utils/cn';

import { useChatContext } from '../../../context/chat-context';
import { useAppLayout } from '../../../hooks/useAppLayout';
import { getAttachmentUrl } from '../../common/attachment';
import { CallButtonFake } from '../../common/call';
import { ChannelEditForm } from '../../common/channel-edit/channel-edit-form';
import { Avatar } from '../../ui/avatar';
import { SearchInput } from '../../ui/search-input';

type MiddleHeaderProps = {
  onBackClick?: () => void;
  onChannelNameClick?: () => void;
};

export const MiddleHeaderContainer = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={cn(
        'border-border bg-background flex min-h-[60px] w-full flex-row items-center gap-2 px-2 md:border-b md:px-4',
        className
      )}
    >
      <div className="flex w-full flex-row items-center gap-2">{children}</div>
    </div>
  );
};

const ChannelDropdown = ({ children }: PropsWithChildren) => {
  const { channelCapabilities, channel } = useChannelStateContext('MiddleHeader');
  const { setActiveChannelId } = useChatContext();

  const [isEditChannelOpen, setIsEditChannelOpen] = useState(false);

  const { mutate: updateChannel, isPending: isUpdating } = useUpdateChannelMutation(channel.id, {
    onSuccess: () => {
      toast.success('Беседа обновлена');
    },
    onError: () => {
      toast.error('Не удалось обновить беседу');
    },
  });

  const { mutate: deleteChannel, isPending: isDeleting } = useDeleteChannelMutation(channel.id, {
    onSuccess: () => {
      setActiveChannelId(null);
      toast.success('Беседа удалена');
    },
    onError: () => {
      toast.error('Не удалось удалить беседу');
    },
  });

  const { mutate: leaveChannel, isPending: isLeaving } = useLeaveChannelMutation(channel.id, {
    onSuccess: () => {
      setActiveChannelId(null);
      toast.success('Беседа покинута');
    },
    onError: () => {
      toast.error('Не удалось покинуть беседу');
    },
  });

  const handleUpdateChannel = (data: Pick<ChannelSchema, 'name'> & { cover?: File }) => {
    updateChannel(data);
  };

  const handleEditChannel = () => {
    setIsEditChannelOpen(true);
  };

  const handleLeaveChannel = () => {
    leaveChannel();
  };

  const handleDeleteChannel = () => {
    deleteChannel();
  };

  const canLeaveChannel = channelCapabilities?.leaveChannel && channel.type !== ChannelType.PRIVATE;
  const canDeleteChannel =
    channel.type === ChannelType.PRIVATE || channelCapabilities?.manageChannel;
  const canManageChannel =
    channelCapabilities?.manageChannel && channel.type !== ChannelType.PRIVATE;

  if (!canLeaveChannel && !canDeleteChannel && !canManageChannel) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {canManageChannel && (
            <DropdownMenuItem className="flex w-full gap-4" onClick={handleEditChannel}>
              <span>Изменить беседу</span>
              <SettingsIcon className="ml-auto size-4 md:size-5" />
            </DropdownMenuItem>
          )}
          {canLeaveChannel && (
            <DropdownMenuItem
              className="text-danger flex w-full gap-4"
              disabled={isLeaving}
              onClick={handleLeaveChannel}
            >
              <span>Покинуть беседу</span>
              <LeaveIcon className="ml-auto size-4 md:size-5" />
            </DropdownMenuItem>
          )}
          {canDeleteChannel && (
            <DropdownMenuItem
              className="text-danger flex w-full gap-4"
              disabled={isDeleting}
              onClick={handleDeleteChannel}
            >
              <span>Удалить беседу</span>
              <TrashIcon className="ml-auto size-4 md:size-5" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isEditChannelOpen} onOpenChange={setIsEditChannelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить беседу</DialogTitle>
          </DialogHeader>
          <ChannelEditForm
            channel={channel}
            onSubmit={handleUpdateChannel}
            onCancel={() => {
              setIsEditChannelOpen(false);
            }}
            isLoading={isUpdating}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

const MiddleHeader = ({ onBackClick, onChannelNameClick }: MiddleHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isMobile } = useAppLayout();
  const { setActiveChannelId } = useChatContext();
  const { channel } = useChannelStateContext('MiddleHeader');

  const renderStatus = () => {
    if (!channel) {
      return '';
    }

    if (channel?.type === ChannelType.GROUP) {
      return channel.members?.filter((member) => !member.is_deleted).length + ' участник(ов)';
    }

    // if (channel?.is_online) {
    //     return 'В сети';
    // }

    return '';
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    setActiveChannelId(null);
  };

  return (
    <MiddleHeaderContainer className="max-md:bg-background/10 max-md:backdrop-blur-xs">
      {isMobile && !isSearchOpen && (
        <Button variant="ghost" circle size="lg" className="md:hidden" onClick={handleBackClick}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      {(!isMobile || (isMobile && !isSearchOpen)) && (
        <Avatar
          className="size-10 md:size-12"
          image={getAttachmentUrl(channel?.cover, 'thumbnail')}
          username={channel?.name}
        />
      )}
      {!isSearchOpen ? (
        <div
          rel="button"
          onClick={onChannelNameClick}
          className={cn('flex flex-col', !!onChannelNameClick && 'cursor-pointer')}
        >
          <div className="text-md line-clamp-1 font-semibold">{channel?.name}</div>
          <div className="text-muted-foreground text-xs">{renderStatus()}</div>
        </div>
      ) : (
        <SearchInput
          placeholder="Поиск"
          className="bg-secondary h-[40px] border-none py-0"
          autoFocusSearch={isSearchOpen}
          onReset={() => setIsSearchOpen(false)}
          canClose
          withBackIcon={isMobile}
        />
      )}
      <div className="ml-auto flex flex-row items-center gap-2">
        {!isSearchOpen && (
          <Button
            variant="secondary"
            circle
            size="lg"
            onClick={() => setIsSearchOpen(true)}
            className="hidden"
          >
            <Search className="size-4 md:size-5" />
          </Button>
        )}
        <CallButtonFake />
        {(!isSearchOpen || !isMobile) && (
          <ChannelDropdown>
            <Button variant="secondary" circle size="lg">
              <DotsVertical className="size-4 md:size-5" />
            </Button>
          </ChannelDropdown>
        )}
      </div>
    </MiddleHeaderContainer>
  );
};

export { MiddleHeader };
