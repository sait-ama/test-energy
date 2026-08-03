'use client';

import { useEffect } from 'react';

import { captureException } from '@sentry/nextjs';

import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';

export default function AboutPage({ error }: { error: Error }) {
  const data = getError(error);
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <ErrorView
      withImage
      className="center m-auto flex w-full items-center justify-center"
      msg={data.message}
      status={data.statusCode}
    />
  );
}
