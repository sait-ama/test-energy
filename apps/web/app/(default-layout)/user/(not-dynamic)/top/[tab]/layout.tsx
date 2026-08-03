import { ReactNode } from 'react';

import { Container } from '~shared/ui/container';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Container style={{ padding: 0 }} layout="tiny" className="my-8 px-0 sm:px-0 md:px-0 lg:px-0">
      {children}
    </Container>
  );
}
