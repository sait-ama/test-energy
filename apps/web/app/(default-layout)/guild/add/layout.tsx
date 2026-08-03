'use server';
import { PropsWithChildren } from 'react';

import { Container } from '~shared/ui/container';

export default async ({ children }: PropsWithChildren) => {
  return (
    <Container slim className="px-4 py-5">
      {children}
    </Container>
  );
};
