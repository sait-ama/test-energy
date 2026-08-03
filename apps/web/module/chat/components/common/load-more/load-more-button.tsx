import React, { PropsWithChildren } from 'react';

import { LoadingIndicator } from './../../ui/loading-indicator';

export type LoadMoreButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
  refreshing?: boolean;
};

const UnMemoizedLoadMoreButton = ({
  children,
  isLoading,
  onClick,
}: PropsWithChildren<LoadMoreButtonProps>) => {
  const childrenOrDefaultString = children ?? 'Загрузить еще';

  return (
    <div className="flex justify-center p-2">
      <button
        aria-label="Загрузить ещё"
        className="text-muted-foreground text-sm"
        data-testid="load-more-button"
        disabled={isLoading}
        onClick={onClick}
      >
        {isLoading ? <LoadingIndicator /> : childrenOrDefaultString}
      </button>
    </div>
  );
};

export const LoadMoreButton = React.memo(
  UnMemoizedLoadMoreButton
) as typeof UnMemoizedLoadMoreButton;
