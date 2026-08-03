import type { PropsWithChildren } from 'react';
import Link from 'next/link';
import { forbidden, notFound, unauthorized } from 'next/navigation';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import { ReText } from '@re/ui-kit/ui/text';

import { getClubsRetrieveQueryOptions } from '~entities/guild/api/queries';
import { isRoleMember } from '~entities/guild/lib/access';
import { getGuildRoleBySession } from '~entities/guild/model/utils';
import { RootTabs } from '~pages/guild/ui/(settings)/root-tabs';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSession } from '~shared/lib/session/get-session';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

export default async ({
  params,
  children,
}: NextPageParams<{ dir: string }> & PropsWithChildren) => {
  const client = getQueryClient();
  const { dir } = await params;
  const session = await getSession();
  if (!session) unauthorized();

  const club = await client.fetchQuery(getClubsRetrieveQueryOptions({ path: { dir } }));

  if (!club) {
    notFound();
  }

  const role = getGuildRoleBySession({ sessionId: session.id, club });

  if (isRoleMember(role)) forbidden();

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <Container layout="extraslim" className="flex flex-col py-8">
        <Link href={Routing.Club.clubByDir({ params: { dir: club.dir as string, tab: 'about' } })}>
          <ReText
            component="h1"
            weight="bold"
            size="2xl"
            className="flex flex-row items-center gap-4"
          >
            <ArrowLeft /> <span>{club.name}</span>
          </ReText>
        </Link>
        <RootTabs>{children}</RootTabs>
      </Container>
    </HydrationBoundary>
  );
};
