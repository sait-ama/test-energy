import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getChapterKey } from '~entities/chapter/model/queries';
import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { EditChapterPage } from '~pages/(chapter)/edit-chapter/ui/edit-chapter-page';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(`pages.edit-chapter-page.meta.${siteConfig.contentType}`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'title-chapter-edit')
);

export default async function EditChapterRootPage({
  params: asyncParams,
}: NextPageParams<{ dir: string; chapterId: string }>) {
  const [{ chapterId }, session] = await Promise.all([asyncParams, getSession()]);
  if (!session) {
    redirect(Routing.Home.main({ query: {} }));
  }

  const queryClient = getQueryClient();

  const prefetches: Promise<void>[] = [
    // queryClient.prefetchQuery(getTitleDetailKey({ variables: { params: { dir } } })),
    queryClient.prefetchQuery(getChapterKey({ variables: { params: { chapter: chapterId } } })),
    queryClient.prefetchQuery(
      getSuspenseUserQuery({ variables: { params: { userId: session.id.toString() } } })
    ),
  ];

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditChapterPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
