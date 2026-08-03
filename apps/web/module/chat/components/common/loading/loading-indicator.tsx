import React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

export type LoadingErrorIndicatorProps = {
  error?: Error;
  className?: string;
};

const UnMemoizedLoadingIndicator = ({ className }: LoadingErrorIndicatorProps) => {
  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center gap-4', className)}>
      <div className="text-muted-foreground text-center">Загрузка чата</div>
    </div>
  );
};

export const LoadingIndicator = React.memo(
  UnMemoizedLoadingIndicator,
  (prevProps, nextProps) => prevProps.error?.message === nextProps.error?.message
) as typeof UnMemoizedLoadingIndicator;
