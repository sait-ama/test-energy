import { memo, PropsWithChildren } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

const GuildChatAppCard = memo(
  ({ className, children }: PropsWithChildren<{ className?: string }>) => {
    return (
      <div
        className={cn(
          'bg-background grid h-full flex-1 overflow-hidden rounded-xl dark:border',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

export { GuildChatAppCard };
