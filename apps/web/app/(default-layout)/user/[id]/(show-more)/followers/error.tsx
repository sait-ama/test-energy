'use client';
import { Error500 } from '~features/error-view/ui';
import { getError } from '~shared/lib/form/error-handling-base';

export default function Error(props: { error: Error }) {
  const err = getError(props.error);
  return (
    <Error500
      status={err.statusCode}
      text={err.message}
      className="min-h-sreen mt-6 flex size-full items-center justify-center"
    />
  );
}
