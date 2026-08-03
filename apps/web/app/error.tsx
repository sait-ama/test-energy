'use client';

import { useEffect } from 'react';

import { captureException } from '@sentry/nextjs';

import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';
import { Container } from '~shared/ui/container';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  const data = getError(error);

  return (
    <Container>
      <ErrorView
        withImage
        componentStack={error.stack}
        status={data.statusCode}
        msg={data.message}
        className="flex h-screen flex-1 items-center justify-center"
      />
    </Container>
  );
}
