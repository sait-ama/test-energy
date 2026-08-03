import React from 'react';

import { useSuspenseTopPeersPaginatedQuery } from 'module/chat/model/toolkit/queries';

import { cn } from '@re/ui-kit/utils/cn';

import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

import { TopPeerItem } from '../user-item/top-peer-item';

export type TopPeersProps = {
  className?: string;
  onContactClick?: (contactId: number) => void;
};

const TopPeersInner: React.FC<TopPeersProps> = ({ className, onContactClick }) => {
  const { data } = useSuspenseTopPeersPaginatedQuery();
  const friends = data?.pages?.[0]?.results || [];

  if (!friends.length) {
    return (
      <div className={cn('text-foreground/60 flex items-center justify-center py-4', className)}>
        No suggested contacts
      </div>
    );
  }

  // Render contacts list
  return (
    <div
      className={cn('scrollbar-hide flex items-center gap-4 overflow-x-auto py-2', className)}
      data-testid="suggested-contacts-list"
    >
      {friends.map((friend) => (
        <TopPeerItem key={friend.id} entity={friend} onClick={onContactClick} />
      ))}
    </div>
  );
};

const TopPeersLoading = (props: TopPeersProps) => {
  return (
    <div
      className={cn('scrollbar-hide flex items-center gap-4 overflow-x-auto py-2', props.className)}
    >
      {/* {Array.from({ length: 5 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex flex-col items-center space-y-1">
                  <div className="bg-foreground/10 h-14 w-14 animate-pulse rounded-full" />
                  <div className="bg-foreground/10 h-2 w-8 animate-pulse rounded" />
              </div>
          ))} */}
    </div>
  );
};

const TopPeersError = (props: { resetErrorBoundary: () => void }) => {
  return (
    <div className="text-destructive flex w-full items-center justify-center p-8">
      Ошибка при поиске чатов. <button onClick={props.resetErrorBoundary}>Попробовать снова</button>
    </div>
  );
};

export const TopPeers: React.FC<TopPeersProps> = (props) => {
  return (
    <QuerySuspenseContainer
      fallback={<TopPeersLoading {...props} />}
      fallbackRender={({ resetErrorBoundary }) => (
        <TopPeersError resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      <TopPeersInner {...props} />
    </QuerySuspenseContainer>
  );
};
