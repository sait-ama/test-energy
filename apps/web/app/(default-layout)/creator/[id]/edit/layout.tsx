import type { ReactElement } from 'react';
import React from 'react';

import { Container } from '~shared/ui/container';

export default function Layout(props: { children: ReactElement }) {
  const { children } = props;

  return (
    <Container slim className="px-2 py-5">
      {children}
    </Container>
  );
}
