import { ReactNode } from 'react';

import { Container } from '~shared/ui/container';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Container layout="tiny" className="my-8">
      {children}
    </Container>
  );
}
