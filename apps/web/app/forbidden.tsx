import { Error403 } from '~features/error-view/ui/error-403';
import { Container } from '~shared/ui/container';

export default function ErrorForbidden() {
  return (
    <Container className="flex h-screen items-center justify-center">
      <Error403 />
    </Container>
  );
}
export const dynamic = 'force-dynamic';
