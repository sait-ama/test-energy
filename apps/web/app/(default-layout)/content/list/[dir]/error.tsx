'use client';

import { ErrorView } from '~features/error-view';
import { getError } from '~shared/lib/form/error-handling-base';
import { Container } from '~shared/ui/container';

export default function ProfileLayoutError(props: { error: Error }) {
  const error = getError(props.error);
  return (
    <Container layout="extraslim" className="space-y-4 py-8">
      <ErrorView withImage status={error.statusCode} msg={error.message} />
    </Container>
  );
}
