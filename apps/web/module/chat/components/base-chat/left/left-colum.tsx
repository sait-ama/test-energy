import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePreviousValue } from '~shared/hooks/use-previous-value';

import {
  ChannelSearchProvider,
  LeftPanelProvider,
  LeftPanelView,
  useChatContext,
  useLeftPanelContext,
} from '../../../context';
import { ChannelSchema } from '../../../model/types';
import { ChannelsList } from '../../common/channel-list/channels-list';
import { ChannelSearchResults, NewChatView } from '../../common/channel-search';
import { NewChannelGroupView } from '../../common/new-channel';
import { Transition } from '../../ui/transition';
import { LeftColumnHeader } from './left-column-header';

const ChannelListWithSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const contextValue = useMemo(
    () => ({
      searchQuery,
      isSearchOpen,
      setIsSearchOpen: (isSearchOpen: boolean) => setIsSearchOpen(isSearchOpen),
      inputRef,
      setSearchQuery,
      clearSearch,
    }),
    [searchQuery, isSearchOpen, setIsSearchOpen, inputRef, setSearchQuery, clearSearch]
  );

  const leftColumnContent = useMemo(() => {
    if (isSearchOpen) {
      return <ChannelSearchResults onBack={() => setIsSearchOpen(false)} />;
    }
    return <ChannelsList />;
  }, [isSearchOpen]);

  return (
    <ChannelSearchProvider value={contextValue}>
      <LeftColumnHeader />
      <Transition
        name={isSearchOpen ? 'zoomFade' : 'zoomFadeBackwards'}
        className="flex h-full flex-col"
        slideClassName="h-full flex-col flex"
      >
        {leftColumnContent}
      </Transition>
    </ChannelSearchProvider>
  );
};

const LeftColumnWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex h-full w-full max-w-screen flex-col md:w-[377px]">{children}</div>;
};

const LeftColumnContent = memo(() => {
  const { currentView, setCurrentView } = useLeftPanelContext();
  const { setActiveChannelId } = useChatContext();

  const prevView = usePreviousValue(currentView);

  const handleCreateChat = useCallback((_dir: number, channel: ChannelSchema) => {
    setCurrentView(LeftPanelView.CHANNELS_LIST);
    setActiveChannelId(channel.id);
  }, []);

  const handleCreateChannel = useCallback(async (channel: ChannelSchema) => {
    setCurrentView(LeftPanelView.CHANNELS_LIST);
    setActiveChannelId(channel.id);
  }, []);

  const handleGoBack = useCallback(() => {
    setCurrentView(LeftPanelView.CHANNELS_LIST);
  }, []);

  const content = useMemo(() => {
    switch (currentView) {
      case LeftPanelView.NEW_CHAT:
        return <NewChatView onCreateChat={handleCreateChat} onBack={handleGoBack} />;
      case LeftPanelView.NEW_CHANNEL:
        return (
          <NewChannelGroupView onCreateChannelGroup={handleCreateChannel} onBack={handleGoBack} />
        );
      case LeftPanelView.CHANNELS_LIST:
      default:
        return <ChannelListWithSearch />;
    }
  }, [currentView, handleCreateChat, handleCreateChannel, handleGoBack]);

  const isNewChannelTransition =
    (currentView === LeftPanelView.CHANNELS_LIST &&
      prevView.current === LeftPanelView.NEW_CHANNEL) ||
    currentView === LeftPanelView.NEW_CHANNEL;

  const isNewChatTransition =
    (currentView === LeftPanelView.CHANNELS_LIST && prevView.current === LeftPanelView.NEW_CHAT) ||
    currentView === LeftPanelView.NEW_CHAT;

  const getTransitionName = () => {
    if (isNewChatTransition) return 'fade';
    if (isNewChannelTransition) return 'slideFade';
    return 'slideFade';
  };

  return (
    <LeftColumnWrapper>
      <Transition
        name={getTransitionName()}
        direction={currentView === LeftPanelView.CHANNELS_LIST ? 'inverse' : 'auto'}
        className="flex h-full flex-col"
        slideClassName="h-full flex-col flex"
      >
        {content}
      </Transition>
    </LeftColumnWrapper>
  );
});

LeftColumnContent.displayName = 'LeftColumnContent';

const LeftColumn = memo(() => {
  const [currentView, setCurrentView] = useState<LeftPanelView>(LeftPanelView.CHANNELS_LIST);

  const value = useMemo(
    () => ({
      currentView,
      setCurrentView,
    }),
    [currentView, setCurrentView]
  );

  return (
    <LeftPanelProvider value={value}>
      <LeftColumnContent />
    </LeftPanelProvider>
  );
});

LeftColumn.displayName = 'LeftColumn';

export { LeftColumn };
