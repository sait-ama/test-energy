import { cn } from '@re/ui-kit/utils/cn';

import { ChatBubleIcon } from '../../ui/icons/buble';

export const ChannelEmptyPlaceholder = (props: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-4',
        props.className
      )}
    >
      <ChatBubleIcon className="h-20 w-20" />
      <div className="text-muted-foreground text-center">
        Выберите чат <br /> или создайте новый
      </div>
    </div>
  );
};
