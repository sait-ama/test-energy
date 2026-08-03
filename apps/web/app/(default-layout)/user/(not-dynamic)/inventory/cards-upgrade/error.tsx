'use client';

import { useEffect } from 'react';

import { captureException } from '@sentry/nextjs';

import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';
import { Container } from '~shared/ui/container';

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
    <Container slim className="flex-1 px-2">
      <ErrorView
        onReload={reset}
        withImage
        msg={data.message}
        status={data.statusCode}
        className="flex min-h-screen items-center justify-center"
      />
    </Container>
  );
}
