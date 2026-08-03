'use client';
import { memo, Suspense } from 'react';

import { LoadingAppIndicator } from './components/common/loading/loading-app-indicator';
import { GuildChatMain, GuildChatMainProps } from './components/guild-chat/guild-chat-main';
import { BetaInfoModal } from './components/modals';
import { GuildChatAppCard } from './components/ui/guild-chat-card';

const GuildChatAppInner = (props: GuildChatMainProps) => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <LoadingAppIndicator />
        </div>
      }
    >
      <GuildChatMain {...props} />
    </Suspense>
  );
};

const GuildChatApp = memo((props: GuildChatMainProps) => {
  return (
    <GuildChatAppCard>
      <GuildChatAppInner {...props} />
      <BetaInfoModal />
    </GuildChatAppCard>
  );
});

export default GuildChatApp;

export { GuildChatApp };
