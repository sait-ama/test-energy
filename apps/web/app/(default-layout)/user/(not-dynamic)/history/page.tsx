import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getUserBookmarksTypesKey, getUserHistoryQuery } from '~entities/user/model/queries';
import { HistoryPage } from '~pages/(user)/history/ui/history-page';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-history.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'user-history')
);

export default async function UserHistory() {
  const session = await getSession();
  const queryClient = getQueryClient();

  if (!session) unauthorized();

  await Promise.allSettled([
    queryClient.prefetchInfiniteQuery(
      getUserHistoryQuery({ variables: { params: { userId: session.id } } })
    ),
    queryClient.prefetchQuery(
      getUserBookmarksTypesKey({ variables: { params: { userId: session.id } } })
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HistoryPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
