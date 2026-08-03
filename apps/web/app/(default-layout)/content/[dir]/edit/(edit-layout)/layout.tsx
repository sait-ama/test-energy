import type { ReactNode } from 'react';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getTitleDetailKey } from '~entities/title/model/queries';
import { BackToTitleButton } from '~features/back-to-title-button/ui/back-to-title-button';
import { EditTitleRoutingLayout } from '~pages/(title)/edit-title/edit-title-bundles-and-chapters-layout';
import { getQueryClient } from '~shared/api/react-query';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

export default async function Layout({
  children,
  params,
}: { children: ReactNode } & NextPageParams<{ dir: string }>) {
  const queryClient = getQueryClient();

  const { dir } = await params;

  await queryClient.prefetchQuery(
    getTitleDetailKey({
      variables: { params: { dir } },
    })
  );

  return (
    <Container className="p-2" slim>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BackToTitleButton />
        <EditTitleRoutingLayout>{children}</EditTitleRoutingLayout>
      </HydrationBoundary>
    </Container>
  );
}
