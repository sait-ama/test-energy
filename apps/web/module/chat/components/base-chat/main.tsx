import { memo, useEffect, useRef, useState } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { Chat } from '../common/chat/chat';
import { LeftColumn } from './left/left-colum';
import { MiddleColumn } from './middle/middle-column';

const ChatMain = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [chatIdFromHash, setChatIdFromHash] = useState<number | undefined>(() => {
    if (typeof window !== 'undefined') {
      const urlHash = window.location.hash;
      const hashMatch = urlHash.match(/#(\d+)/);
      if (hashMatch && hashMatch[1]) {
        return parseInt(hashMatch[1]);
      }
    }
    return undefined;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const urlHash = window.location.hash;
      const hashMatch = urlHash.match(/#(\d+)/);
      if (hashMatch && hashMatch[1]) {
        setChatIdFromHash(parseInt(hashMatch[1]));
      } else {
        setChatIdFromHash(undefined);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <Chat chatId={chatIdFromHash}>
      <div
        ref={containerRef}
        className={cn('grid h-full grid-rows-[100%] overflow-hidden md:grid-cols-[auto_1fr]')}
      >
        <LeftColumn />
        <MiddleColumn />
      </div>
    </Chat>
  );
});

export { ChatMain };
