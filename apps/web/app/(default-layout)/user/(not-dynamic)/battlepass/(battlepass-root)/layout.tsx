import { ReactNode } from 'react';

import { Container } from '~shared/ui/container';

import { BattlepassPageLayout } from './_layout';

export default function BattlepassLayout({ children }: { children: ReactNode }) {
  return (
    <Container slim className="flex flex-col gap-2 px-2">
      <BattlepassPageLayout>{children}</BattlepassPageLayout>
    </Container>
  );
}

export const dynamic = 'force-dynamic';
