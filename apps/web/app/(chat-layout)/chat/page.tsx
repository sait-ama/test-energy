'use client';
import { Error401 } from '~features/error-view/ui/error-401';
import { useLogged } from '~shared/lib/session/use-logged';

import { ChatAppAsync } from '../../../module/chat/ChatApp.async';
import { ChatAppCard } from '../../../module/chat/components/ui/chat-card';

const ChatRootPage = () => {
  const logged = useLogged();

  if (!logged) {
    return (
      <ChatAppCard className="flex h-full flex-1 flex-col items-center justify-center">
        <Error401 text="Авторизируйтесь, чтобы чатиться" className="flex h-full" />
      </ChatAppCard>
    );
  }

  return <ChatAppAsync />;
};

export default ChatRootPage;

export const dynamic = 'force-dynamic';
