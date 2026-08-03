'use client';
import type { ReactNode } from 'react';
import React from 'react';

import { Container } from '~shared/ui/container';

interface BattlepassLayoutProps {
  children?: ReactNode;
}

export const BattlepassLayout = (props: BattlepassLayoutProps) => {
  const { children } = props;

  return (
    <Container slim>
      <div className="my-2 w-full items-center justify-center">{children}</div>
    </Container>
  );
};
