import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getCreatorFormsKey } from '~entities/creator/model/queries';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { CreateCreatorForm } from '~widgets/create-creator/ui/create-creator';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(`creator-add-page.meta`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'creator-add')
);

export default async function CreatorAdd() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(getCreatorFormsKey());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CreateCreatorForm />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
