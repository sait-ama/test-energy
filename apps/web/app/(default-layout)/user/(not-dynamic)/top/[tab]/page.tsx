import { getTranslations } from 'next-intl/server';

import { getConfiguration } from '~pages/(user)/top/model/const';
import { UserTopDetailBreadcrumbsLd } from '~pages/(user)/top/user-top-detailed-ld';
import { UserTopDetailedPage } from '~pages/(user)/top/user-top-detailed-page';
import { queryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { EventDateType, getEvent } from '~shared/lib/event-management/get-event';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ tab: UserTopOrdering }>(
  withMetadataCache(async (props) => {
    const { tab } = await props.params;
    const event = getEvent();
    const tabIsEvent = tab === UserTopOrdering.EVENT_POINTS;
    const isEvent = tabIsEvent && event !== EventDateType.DEFAULT;
    const type = isEvent ? event : tab;

    const t = await getTranslations(`pages.user-top.meta${isEvent ? '.event' : ''}`);

    const siteConfig = getSiteConfig()!;
    const { queryOptions } = getConfiguration(tab);

    const data = await queryClient.fetchInfiniteQuery(queryOptions);
    const usersList =
      data?.pages
        ?.flatMap((it) => it.results || [])
        ?.map((it) => it.username)
        ?.filter(Boolean)
        ?.join(', ') || '';
    return generateNextMetadata({
      title: t('title', { type }),
      description: t('description', {
        siteName: siteConfig.site.name,
        type,
        users: usersList,
      }),
      canonical: Routing.User.topDetail({ params: { tab } }),
    });
  }, 'user-top-detailed')
);

export default async function Page({ params }: NextPageParams<{ tab: UserTopOrdering }>) {
  const { tab } = await params;

  return (
    <>
      <UserTopDetailBreadcrumbsLd tab={tab} />
      <UserTopDetailedPage tab={tab} />
    </>
  );
}

export const dynamic = 'force-dynamic';
