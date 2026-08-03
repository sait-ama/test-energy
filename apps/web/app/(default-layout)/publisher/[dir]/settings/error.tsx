'use client';
import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';

export default ({ error }: { error: Error }) => {
  const { statusCode, message } = getError(error);
  return <ErrorView status={statusCode} msg={message} />;
};
