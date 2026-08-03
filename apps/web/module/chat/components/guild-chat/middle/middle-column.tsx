import { memo } from 'react';

import { ClubDetail } from '@re/api/generated/types.gen';
import { cn } from '@re/ui-kit/utils/cn';

import { Channel } from '../../common/channel/channel';
import { MessageListErrorBoundary } from '../../common/error-boundary';
import { MessageInput } from '../../common/message-input/message-input';
import { VirtualizedMessageList } from '../../common/message-list/virtualized-message-list';
import { ChatBubleIcon } from '../../ui/icons';
import { MiddleHeader } from './middle-header';

const MiddleColumn = memo(({ club }: { club: ClubDetail }) => {
  return (
    <div className={cn('flex h-full w-full flex-col')}>
      <Channel
        EmptyPlaceholder={
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <ChatBubleIcon className="h-20 w-20" />
            <div className="text-muted-foreground text-center">
              Выберите чат <br /> или создайте новый
            </div>
          </div>
        }
        LoadingIndicator={() => (
          <>
            <MiddleHeader club={club} />
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              <div className="text-muted-foreground text-center">Загрузка чата</div>
            </div>
          </>
        )}
        LoadingErrorIndicator={() => (
          <>
            <MiddleHeader club={club} />
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              <div className="text-muted-foreground text-center">Ошибка загрузки чата</div>
            </div>
          </>
        )}
      >
        <MiddleHeader club={club} />
        <MessageListErrorBoundary>
          <VirtualizedMessageList />
        </MessageListErrorBoundary>
        <div className="flex w-full items-center justify-center">
          <MessageInput grow maxRows={6} />
        </div>
      </Channel>
    </div>
  );
});

export { MiddleColumn };
