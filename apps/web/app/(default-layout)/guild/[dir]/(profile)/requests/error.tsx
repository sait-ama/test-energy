'use client';

import { useEffect } from 'react';

import { captureException } from '@sentry/nextjs';

import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  const data = getError(error as any);

  return (
    <ErrorView
      withImage
      componentStack={error.stack}
      status={data.statusCode}
      msg={data.message}
      className="flex items-center justify-center pb-8"
    />
  );
}
