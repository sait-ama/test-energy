'use client';

import { useEffect } from 'react';

import { captureException } from '@sentry/nextjs';

import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';

import { ChatAppCard } from '../../../module/chat/components/ui/chat-card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  const data = getError(error);

  return (
    <ChatAppCard className="flex h-full flex-1 flex-col items-center justify-center">
      <ErrorView onReload={reset} withImage msg={data.message} status={data?.statusCode} />
    </ChatAppCard>
  );
}
