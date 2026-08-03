'use client';

import dynamic from 'next/dynamic';

import LoadingAppIndicator from './components/common/loading/loading-app-indicator';
import { ChatAppCard } from './components/ui/chat-card';

const LoadingPlaceholder = () => {
  return (
    <ChatAppCard className="flex h-full w-full flex-1 items-center justify-center md:mt-2 md:mb-4 md:rounded-xl md:border">
      <LoadingAppIndicator />
    </ChatAppCard>
  );
};

const ChatAppAsync = dynamic(() => import('./ChatApp'), {
  ssr: false,
  loading: () => <LoadingPlaceholder />,
});

export { ChatAppAsync };
