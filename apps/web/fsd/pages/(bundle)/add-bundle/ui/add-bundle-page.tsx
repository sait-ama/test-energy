'use client';

import { TitleEditProvider } from '~entities/title/model/store';
import { AddBundleTable } from '~pages/(bundle)/add-bundle/ui/add-bundle-table';
import { Container } from '~shared/ui/container';

export const AddBundlePage = () => (
  <Container slim>
    <TitleEditProvider>
      <AddBundleTable />
    </TitleEditProvider>
  </Container>
);
