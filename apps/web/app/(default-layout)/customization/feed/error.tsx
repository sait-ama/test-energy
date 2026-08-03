'use client';

import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';

export default function ErrorPage({ error }: { error: Error }) {
  const data = getError(error);
  return (
    <ErrorView
      msg={data.message}
      status={data.statusCode}
      className="center m-auto flex w-full items-center justify-center"
    />
  );
}
