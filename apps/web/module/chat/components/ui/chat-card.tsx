import { memo, PropsWithChildren } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

const ChatAppCard = memo(({ className, children }: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={cn(
        'bg-background grid h-full flex-1 overflow-hidden md:mt-2 md:mb-4 md:rounded-xl md:border',
        className
      )}
    >
      {children}
    </div>
  );
});

export { ChatAppCard };
