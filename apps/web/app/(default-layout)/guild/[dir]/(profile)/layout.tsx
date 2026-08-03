import type { PropsWithChildren } from 'react';
import { forbidden, notFound, unauthorized } from 'next/navigation';

import { captureException } from '@sentry/nextjs';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getClubsRetrieveQueryOptions } from '~entities/guild/api/queries';
import { GuildHeader } from '~pages/guild/ui/(by-dir)/guild-header';
import { RootTabs } from '~pages/guild/ui/(by-dir)/root-tabs';
import { getQueryClient } from '~shared/api/react-query';
import { getError } from '~shared/lib/form/error-handling-base';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';
import { EntityLayoutContent, EntityLayoutRoot } from '~shared/ui/entity-layout';

export default async ({
  params,
  children,
}: NextPageParams<{ dir: string }> & PropsWithChildren) => {
  const { dir } = await params;
  const queryClient = getQueryClient();

  try {
    const club = await queryClient.fetchQuery(
      getClubsRetrieveQueryOptions({
        path: { dir },
      })
    );

    return (
      <EntityLayoutRoot wallpaper={club?.wallpaper?.high}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <EntityLayoutRoot wallpaper={club?.wallpaper?.high ?? ''}>
            <Container className="flex flex-col px-2" slim>
              <GuildHeader />
              <EntityLayoutContent>
                <RootTabs>{children}</RootTabs>
              </EntityLayoutContent>
            </Container>
          </EntityLayoutRoot>
        </HydrationBoundary>
      </EntityLayoutRoot>
    );
  } catch (e) {
    captureException(e);
    const data = getError(e as Error);
    if (data.statusCode == 401) unauthorized();
    if (data.statusCode == 403) forbidden();
    if (data.statusCode == 404) notFound();
    throw data;
  }
};
