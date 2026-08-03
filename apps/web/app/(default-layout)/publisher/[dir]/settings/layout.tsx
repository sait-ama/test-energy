import { ReactNode } from 'react';
import Link from 'next/link';
import { unauthorized } from 'next/navigation';

import { getPathname } from '@nimpl/getters/get-pathname';
import { captureException } from '@sentry/nextjs';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Separator } from '@re/ui-kit/ui/separator';
import { ReText } from '@re/ui-kit/ui/text';

import { CurPublisherDeps } from '~entities/publisher/model/context';
import { getPublisherQuery } from '~entities/publisher/model/queries';
import { ErrorView } from '~features/error-view';
import { SidebarNav } from '~pages/(publisher)/publisher-tabs/publisher-settings-sidebar';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getError } from '~shared/lib/form/error-handling-base';
import { getSession } from '~shared/lib/session/get-session';
import { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

import { ContentWith403Checking } from './_content-v2';

export default async function SettingsLayout({
  children,
  params,
}: NextPageParams<{ dir: string }> & { children: ReactNode }) {
  try {
    const queryClient = getQueryClient();
    const [session, { dir }] = await Promise.all([getSession(), params]);
    if (!session) unauthorized();
    const pathName = getPathname();
    const tab = pathName!.split('/').at(-1)!;
    const publisher = await queryClient.fetchQuery(
      getPublisherQuery({ variables: { params: { dir } } })
    );

    // const canViewSettings = ability.can('read', 'something');
    // const canViewCurrentPage = ability.can('read', tab);
    // const canViewSomething = ability.can('read', 'something');

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Container slim className="relative mt-4 px-3">
          <ReText size="xl" weight="semibold">
            Настройки команды
            <Link
              prefetch={false}
              href={Routing.Publisher.detail({
                params: { dir: publisher.content.dir, tab: 'about' },
              })}
              className="text-primary ml-1 underline hover:cursor-pointer"
            >
              {publisher.content.name}
            </Link>
          </ReText>
          <Separator className="my-4" />
          <div className="flex flex-col gap-2 lg:flex-row">
            <aside className="w-full overflow-auto lg:w-1/5">
              <SidebarNav />
            </aside>
            <div className="flex-1">
              <ContentWith403Checking publisher={publisher} tab={tab}>
                <CurPublisherDeps value={publisher.content.id}>{children}</CurPublisherDeps>
              </ContentWith403Checking>
            </div>
          </div>
        </Container>
      </HydrationBoundary>
    );
  } catch (e: unknown) {
    captureException(e);
    const data = getError(e);

    return (
      <Container slim className="flex-1 px-2">
        <ErrorView
          withImage
          msg={data.message}
          status={data.statusCode}
          className="flex min-h-screen items-center justify-center"
        />
      </Container>
    );
  }
}
