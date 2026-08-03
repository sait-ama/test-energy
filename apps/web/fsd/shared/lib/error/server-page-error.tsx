'use client';

import { notFound } from 'next/navigation';

import { captureException } from '@sentry/nextjs';

import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';

interface ServerPageErrorProps {
  error: unknown;
  className?: string;
}

export const ServerPageError = ({ error, className }: ServerPageErrorProps) => {
  captureException(error);
  const data = getError(error as Error);

  if (data.statusCode === 404) {
    notFound();
  }

  return <ErrorView withImage msg={data.message} status={data.statusCode} className={className} />;
};
