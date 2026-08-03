import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getLastChapterKey } from '~entities/chapter/model/queries';
import { getTitleDetailKey } from '~entities/title/model/queries';
import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { AddChapterPage } from '~pages/(chapter)/add-chapter/ui/add-chapter-page';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;

    const t = await getTranslations(`pages.add-chapter.meta.${contentType}`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'title-chapter-add')
);

export default async function AddChapterRootPage(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const session = await getSession();

  const branchId = searchParams.branch;

  if (!session || !branchId) {
    redirect(Routing.Home.main({ query: {} }));
  }

  const queryClient = getQueryClient();

  const { dir } = params as { dir: string; chapterId: string };

  const prefetches: Promise<void>[] = [
    queryClient.prefetchQuery(getTitleDetailKey({ variables: { params: { dir } } })),
    queryClient.prefetchQuery(getLastChapterKey({ variables: { query: { branch_id: branchId } } })),
    queryClient.prefetchQuery(
      getSuspenseUserQuery({ variables: { params: { userId: session.id.toString() } } })
    ),
  ];

  await Promise.all(prefetches);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AddChapterPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
