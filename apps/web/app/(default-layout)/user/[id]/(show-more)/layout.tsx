import type { ReactElement } from 'react';
import React from 'react';

import { Container } from '~shared/ui/container';

export default async function Layout(props: { children: ReactElement }) {
  const { children } = props;

  return (
    <Container slim className="mt-4 rounded-md">
      {children}
    </Container>
  );
}
