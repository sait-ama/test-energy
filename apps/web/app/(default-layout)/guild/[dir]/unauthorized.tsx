'use client';
import { useParams } from 'next/navigation';

import { Error403 } from '~features/error-view/ui/error-403';
import { Routing } from '~shared/config/routing';
import { Container } from '~shared/ui/container';

export default function UnAuthorized() {
  const { dir } = useParams<{ dir: string }>();
  return (
    <Container className="flex h-screen items-center justify-center">
      <Error403 abort={Routing.Club.clubByDir({ params: { dir: dir, tab: 'about' } })} />
    </Container>
  );
}
