import React from 'react';

import { ChatBubleIcon } from './../../ui/icons';

export type EmptyStateIndicatorProps = {
  /** List Type: channel | message */
  listType?: 'channel' | 'message';
};

const UnMemoizedEmptyStateIndicator = (props: EmptyStateIndicatorProps) => {
  const { listType } = props;

  if (listType === 'channel') {
    const text = 'Ни одного чата..';
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center">
          <ChatBubleIcon />
          <p role="listitem">{text}</p>
        </div>
      </>
    );
  }

  if (listType === 'message') {
    const text = 'Ни одного сообщения..';
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <ChatBubleIcon />
        <p className="text-muted-foreground text-sm" role="listitem">
          {text}
        </p>
      </div>
    );
  }

  return <p>Пусто.</p>;
};

export const EmptyStateIndicator = React.memo(
  UnMemoizedEmptyStateIndicator
) as typeof UnMemoizedEmptyStateIndicator;
