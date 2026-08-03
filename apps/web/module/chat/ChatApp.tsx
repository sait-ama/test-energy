'use client';
import { memo, Suspense } from 'react';

import { ChatMain } from './components/base-chat/main';
import { LoadingAppIndicator } from './components/common/loading/loading-app-indicator';
import { BetaInfoModal } from './components/modals';
import { ChatAppCard } from './components/ui/chat-card';

const ChatAppInner = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <LoadingAppIndicator />
        </div>
      }
    >
      <ChatMain />
    </Suspense>
  );
};

const ChatApp = memo(() => {
  return (
    <ChatAppCard>
      <ChatAppInner />
      <BetaInfoModal />
    </ChatAppCard>
  );
});

export default ChatApp;

export { ChatApp };
