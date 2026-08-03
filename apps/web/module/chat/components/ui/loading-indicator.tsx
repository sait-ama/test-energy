import React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

// FIXME: remove color and size props and let the loading indicator to be styled via CSS
export type LoadingIndicatorProps = {
  className?: string;
  onClick?: NoneToVoidFunction;
};

const UnMemoizedLoadingIndicator = (props: LoadingIndicatorProps) => {
  const { className, onClick } = props;

  return (
    <div
      className={cn(
        'border-primary size-12 animate-spin rounded-full border-4 border-t-transparent',
        className
      )}
      onClick={onClick}
    />
  );
};

/**
 * Simple loading spinner
 */
export const LoadingIndicator = React.memo(
  UnMemoizedLoadingIndicator
) as typeof UnMemoizedLoadingIndicator;
