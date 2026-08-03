'use client';

import { captureException } from '@sentry/nextjs';

import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';
import { Container } from '~shared/ui/container';

export default function PublisherError({ error }: { error: Error & { digest?: string } }) {
  // useEffect(() => {
  //     // Log the error to an error reporting service
  // }, [error]);
  captureException(error);
  const data = getError(error);

  return (
    <Container slim className="flex-1 px-2">
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
