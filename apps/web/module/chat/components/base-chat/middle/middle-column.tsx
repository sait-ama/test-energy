import { memo, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { useChannelStateContext } from 'module/chat/context';
import { ChannelType } from 'module/chat/model/types';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@re/ui-kit/ui/dialog';
import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

import { useChatContext } from '../../../context/chat-context';
import { Channel } from '../../common/channel/channel';
import {
  ChannelDetailsAvatar,
  ChannelDetailsDescription,
  ChannelDetailsName,
  ChannelDetailsRoot,
} from '../../common/channel-details/channel-details';
import {
  ChannelMemberPreviewDialog,
  ChannelMemberPreviewDialogContent,
} from '../../common/channel-members/channel-member-preview';
import {
  ChannelMembersList,
  ChannelMembersListContainer,
} from '../../common/channel-members/channel-members-list';
import { InviteChannelMemersForm } from '../../common/channel-members/invite-channel-memers-form';
import { MessageListErrorBoundary } from '../../common/error-boundary';
import { MessageInput } from '../../common/message-input/message-input';
import { VirtualizedMessageList } from '../../common/message-list/virtualized-message-list';
import { MiddleHeader, MiddleHeaderContainer } from './middle-header';

const MiddleColumnWrapper = ({ children }: PropsWithChildren) => {
  const { activeChannelId } = useChatContext();
  const isOpen = !!activeChannelId;

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col md:border-l',
        'max-md:bg-background max-md:absolute max-md:top-0 max-md:left-0 max-md:z-1000 max-md:h-full max-md:w-full',
        {
          'max-md:hidden': !isOpen,
        }
      )}
    >
      {children}
    </div>
  );
};

type ChannelDetailsContentProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ChannelDetailsContent = (props: ChannelDetailsContentProps) => {
  const { isOpen, onClose } = props;
  const { channel } = useChannelStateContext();
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredMembers = useMemo(() => {
    return channel.members?.filter((member) => !member.is_deleted);
  }, [channel.members]);

  return (
    <div className="absolute top-0 left-0 z-100 flex size-full flex-col">
      <MiddleHeaderContainer>
        <Button variant="ghost" circle size="lg" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </MiddleHeaderContainer>
      <ChannelDetailsRoot className="flex h-full w-full flex-col md:items-start">
        <div className="flex w-full flex-col items-center gap-4 border-b p-8 md:flex-row md:gap-8">
          <ChannelDetailsAvatar />
          <div className="flex flex-col items-center gap-2 md:items-start">
            <ChannelDetailsName />
            <ChannelDetailsDescription />
          </div>
        </div>
        {channel.type === ChannelType.GROUP && (
          <>
            <ScrollArea className="w-full pb-16">
              <ChannelMembersListContainer className="flex w-full flex-col items-start px-8">
                <div className="flex w-full flex-row justify-between">
                  <h4 className="text-lg font-semibold">Участники</h4>
                  <Button
                    size="sm"
                    onClick={() => setIsAddMemberModalOpen(true)}
                    variant="flat"
                    color="secondary"
                    // className="px-0"
                  >
                    Добавить участников
                  </Button>
                </div>
                <ChannelMembersList behavior="preview" members={filteredMembers} />
                <ChannelMemberPreviewDialog>
                  <ChannelMemberPreviewDialogContent />
                </ChannelMemberPreviewDialog>
              </ChannelMembersListContainer>
            </ScrollArea>
            <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
              <DialogContent className="top-20 translate-y-0 p-0">
                <DialogHeader className="px-6 pt-6 max-sm:text-start">
                  <DialogTitle>Добавить участников</DialogTitle>
                </DialogHeader>
                <InviteChannelMemersForm
                  className="h-screen max-h-[calc(100vh-160px)]"
                  filterUsers={filteredMembers}
                  onSuccess={() => {
                    setIsAddMemberModalOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </ChannelDetailsRoot>
    </div>
  );
};

const MiddleColumnContent = () => {
  const [isChannelDetailsOpen, setIsChannelDetailsOpen] = useState(false);
  const { activeChannelId } = useChatContext();

  useEffect(() => {
    setIsChannelDetailsOpen(false);
  }, [activeChannelId]);

  const handleChannelNameClick = useCallback(() => {
    setIsChannelDetailsOpen(true);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col">
      <MiddleHeader onChannelNameClick={handleChannelNameClick} />
      <MessageListErrorBoundary>
        <VirtualizedMessageList />
      </MessageListErrorBoundary>
      <div className="z-10 flex w-full items-center justify-center">
        <MessageInput isUploadEnabled={false} publishTypingEvent={false} focus grow maxRows={6} />
      </div>
      {isChannelDetailsOpen && (
        <ChannelDetailsContent
          isOpen={isChannelDetailsOpen}
          onClose={() => setIsChannelDetailsOpen(false)}
        />
      )}
    </div>
  );
};

const MiddleColumn = memo(() => {
  return (
    <MiddleColumnWrapper>
      <Channel dragAndDropWindow={false}>
        <MiddleColumnContent />
        <ChannelMemberPreviewDialog>
          <ChannelMemberPreviewDialogContent />
        </ChannelMemberPreviewDialog>
      </Channel>
    </MiddleColumnWrapper>
  );
});

export { MiddleColumn };
