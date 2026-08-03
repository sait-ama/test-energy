import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { captureException } from '@sentry/nextjs';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Button } from '@re/ui-kit/ui/button';

import { PublisherProfileAbilityBuilder } from '~entities/publisher/model/ability/rights';
import { CurPublisherDeps } from '~entities/publisher/model/context';
import { getPublisherMemberDetailKey, getPublisherQuery } from '~entities/publisher/model/queries';
import { PublisherRepository } from '~entities/publisher/model/repository';
import { ErrorView } from '~features/error-view';
import { Header } from '~pages/(publisher)/header/header';
import { PublisherTabs } from '~pages/(publisher)/publisher-tabs/publisher-tabs';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { getError } from '~shared/lib/form/error-handling-base';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';
import { EntityLayoutRoot } from '~shared/ui/entity-layout';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const generateMetadata = fallbackDefaultMetadata(
  async ({ params }: NextPageParams<{ dir: string }>): Promise<Metadata> => {
    const { dir } = await params;
    const publisher = await PublisherRepository.getPublisherByDir({ params: { dir } });
    const title = publisher.content.name;
    const description = `${(publisher.content.description || '').replace(/(<([^>]+)>)/gi, '').slice(0, 157)}...`;

    return generateNextMetadata({
      title,
      description,
      og: {
        image: UrlFormatter.media(publisher.content.cover.high) as string,
        alt: title,
      },
    });
  }
);

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ dir: string }>;
}) {
  const _ability = new PublisherProfileAbilityBuilder({ publisherDep: undefined, session: null });

  const [session, { dir }, t] = await Promise.all([
    getSession(),
    params,
    getTranslations('reusable.errors.default'),
  ]);
  const queryClient = getQueryClient();
  const siteConfig = getSiteConfig()!;

  try {
    const prefetches = [
      await queryClient.fetchQuery(
        getPublisherQuery({
          variables: { params: { dir: dir } },
        })
      ),
    ];
    const [publisher] = await Promise.all(prefetches);
    _ability.publisherDep = publisher?.props;
    _ability.session = session;
    _ability.feats = siteConfig?.features!;
    if (!!session && publisher?.props?.is_member) {
      _ability.sessionAsMember = await queryClient
        .fetchQuery(
          getPublisherMemberDetailKey({
            variables: {
              params: {
                id: publisher.content.id,
                memberId: session?.id,
              },
            },
          })
        )
        .catch(() => undefined);
    }
    const ability = _ability.build();

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <EntityLayoutRoot wallpaper={publisher?.content?.wallpaper.high || ''}>
          <CurPublisherDeps value={publisher?.content.id}>
            <Header />
            <Container slim className="px-2">
              <PublisherTabs initialAbility={ability.getSubjectsForAction('read')}>
                {children}
              </PublisherTabs>
            </Container>
          </CurPublisherDeps>
        </EntityLayoutRoot>
      </HydrationBoundary>
    );
  } catch (e: unknown) {
    captureException(e);
    const { statusCode, message } = getError(e as Error);
    //todo remove after ability
    return (
      <Container slim className="flex-1 px-2">
        <ErrorView
          actions={
            <Link shallow={false} prefetch={false} href="/">
              <Button>{t('linking')}</Button>
            </Link>
          }
          msg={message}
          status={statusCode}
          className="flex min-h-screen items-center justify-center"
        />
      </Container>
    );
  }
}
