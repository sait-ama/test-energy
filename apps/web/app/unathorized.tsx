import { Error401 } from '~features/error-view/ui';
import { Container } from '~shared/ui/container';

export default function ErrorNotAuthorized() {
  return (
    <Container className="flex h-screen items-center justify-center">
      <Error401 />
    </Container>
  );
}
export const dynamic = 'force-dynamic';
