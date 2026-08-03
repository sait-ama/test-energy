'use client';

import dynamic from 'next/dynamic';

import LoadingAppIndicator from './components/common/loading/loading-app-indicator';
import { GuildChatMainProps } from './components/guild-chat/guild-chat-main';
import { GuildChatAppCard } from './components/ui/guild-chat-card';

const LoadingPlaceholder = () => {
  return (
    <GuildChatAppCard className="flex h-full w-full flex-1 items-center justify-center">
      <LoadingAppIndicator />
    </GuildChatAppCard>
  );
};

const GuildChatAppAsync = dynamic<GuildChatMainProps>(() => import('./GuildChatApp'), {
  ssr: false,
  loading: () => <LoadingPlaceholder />,
});

export { GuildChatAppAsync };
