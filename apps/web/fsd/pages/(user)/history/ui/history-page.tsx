'use client';

import { Container } from '~shared/ui/container';
import { HistoryList } from '~widgets/history-list/ui/history-list';

export const HistoryPage = () => (
  <Container slim className="mt-4 flex-1 space-y-4">
    <HistoryList />
  </Container>
);
