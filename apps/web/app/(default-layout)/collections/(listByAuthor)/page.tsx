import { getTranslations } from 'next-intl/server';

import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { BadgesLabels } from '~widgets/(collections)/_filters';
import { CollectionsList } from '~widgets/(collections)/_list';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(
      `pages.collections.collections-page.meta.${siteConfig.contentType}`
    );

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      canonical: Routing.Collection.list({ query: {} }),
    });
  }, 'collections-list')
);

export default async function CollectionsPage() {
  return (
    <>
      <BadgesLabels />
      <CollectionsList />
    </>
  );
}

export const dynamic = 'force-dynamic';
